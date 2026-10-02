const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
const uploadDir = path.join(__dirname, '../../uploads/revision');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, callback) => callback(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
  }),
  limits: { fileSize: 75 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (/^(image\/|video\/)/.test(file.mimetype)) return callback(null, true);
    callback(new Error('Only image and video files are supported'));
  }
});

const getPost = (postId) => prisma.revisionPost.findUnique({
  where: { id: postId },
  include: { subject: { include: { classroom: true } } }
});

router.get('/subjects', async (req, res, next) => {
  try {
    const where = req.user.role === 'TEACHER'
      ? { classroom: { teacherId: req.user.id } }
      : { classroom: { enrollments: { some: { studentId: req.user.id } } } };
    const subjects = await prisma.subject.findMany({
      where,
      include: { classroom: { select: { id: true, name: true, section: true } } },
      orderBy: [{ classroom: { name: 'asc' } }, { name: 'asc' }]
    });
    res.json(subjects);
  } catch (error) {
    next(error);
  }
});

router.get('/media/:filename', async (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename);
    if (filename !== req.params.filename) {
      res.status(404);
      throw new Error('Revision media not found');
    }
    const post = await prisma.revisionPost.findFirst({
      where: { mediaUrl: `/revision/media/${filename}` },
      include: { subject: { include: { classroom: true } } }
    });
    if (!post) {
      res.status(404);
      throw new Error('Revision media not found');
    }
    const authorized = req.user.role === 'TEACHER'
      ? post.subject.classroom.teacherId === req.user.id
      : !!await prisma.classEnrollment.findUnique({
        where: { classroomId_studentId: { classroomId: post.subject.classroomId, studentId: req.user.id } }
      });
    if (!authorized) {
      res.status(403);
      throw new Error('Not authorized to view this revision media');
    }
    res.sendFile(path.join(uploadDir, filename));
  } catch (error) {
    next(error);
  }
});

router.get('/posts', async (req, res, next) => {
  try {
    const isTeacher = req.user.role === 'TEACHER';
    const where = {
      subject: {
        ...(req.query.subjectId ? { id: req.query.subjectId } : {}),
        classroom: {
          ...(req.query.classroomId ? { id: req.query.classroomId } : {}),
          ...(isTeacher
            ? { teacherId: req.user.id }
            : { enrollments: { some: { studentId: req.user.id } } })
        }
      }
    };
    const posts = await prisma.revisionPost.findMany({
      where,
      include: {
        subject: { include: { classroom: { select: { id: true, name: true, section: true } } } },
        createdBy: { select: { name: true } },
        interactions: isTeacher
          ? { where: { liked: true }, select: { id: true } }
          : { where: { OR: [{ liked: true }, { studentId: req.user.id }] }, select: { studentId: true, liked: true, saved: true, priority: true, understanding: true } },
        reviews: isTeacher
          ? { select: { message: true, createdAt: true, updatedAt: true }, orderBy: { updatedAt: 'desc' } }
          : { where: { studentId: req.user.id }, select: { message: true, createdAt: true, updatedAt: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(posts.map(({ interactions, reviews, ...post }) => {
      const myInteraction = interactions.find(item => item.studentId === req.user.id) || null;
      return {
        ...post,
        likes: isTeacher ? interactions.length : interactions.filter(item => item.liked).length,
        interaction: isTeacher ? null : myInteraction,
        review: isTeacher ? undefined : (reviews[0] || null),
        reviews: isTeacher ? reviews : undefined
      };
    }));
  } catch (error) {
    next(error);
  }
});

router.post('/posts', requireRole('TEACHER'), upload.single('media'), async (req, res, next) => {
  try {
    const { subjectId, title, content = '' } = req.body;
    if (!subjectId || !title?.trim() || (!content.trim() && !req.file)) {
      if (req.file) fs.unlink(req.file.path, () => {});
      res.status(400);
      throw new Error('Choose a subject, add a title, and provide notes or media');
    }
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, classroom: { teacherId: req.user.id } }
    });
    if (!subject) {
      if (req.file) fs.unlink(req.file.path, () => {});
      res.status(403);
      throw new Error('Not authorized to post in this subject');
    }
    const post = await prisma.revisionPost.create({
      data: {
        subjectId,
        createdById: req.user.id,
        title: title.trim(),
        content: content.trim(),
        mediaUrl: req.file ? `/revision/media/${req.file.filename}` : null,
        mediaType: req.file?.mimetype.startsWith('image/') ? 'IMAGE' : req.file ? 'VIDEO' : null
      },
      include: { subject: { include: { classroom: { select: { id: true, name: true, section: true } } } }, createdBy: { select: { name: true } } }
    });
    res.status(201).json({ ...post, likes: 0, interaction: null, reviews: [] });
  } catch (error) {
    next(error);
  }
});

router.put('/posts/:postId/interaction', requireRole('STUDENT'), async (req, res, next) => {
  try {
    const post = await getPost(req.params.postId);
    if (!post || !await prisma.classEnrollment.findUnique({
      where: { classroomId_studentId: { classroomId: post.subject.classroomId, studentId: req.user.id } }
    })) {
      res.status(404);
      throw new Error('Revision post not found');
    }
    const { liked, saved, priority, understanding } = req.body;
    const data = {};
    for (const key of ['liked', 'saved', 'priority']) {
      if (typeof req.body[key] === 'boolean') data[key] = req.body[key];
    }
    if (understanding === null || ['GOT_IT', 'REVIEW_AGAIN', 'CONFUSED'].includes(understanding)) data.understanding = understanding;
    if (!Object.keys(data).length) {
      res.status(400);
      throw new Error('No valid revision action provided');
    }
    const interaction = await prisma.revisionInteraction.upsert({
      where: { postId_studentId: { postId: post.id, studentId: req.user.id } },
      create: { postId: post.id, studentId: req.user.id, ...data },
      update: data
    });
    res.json(interaction);
  } catch (error) {
    next(error);
  }
});

router.put('/posts/:postId/review', requireRole('STUDENT'), async (req, res, next) => {
  try {
    const message = req.body.message?.trim();
    if (!message || message.length > 1000) {
      res.status(400);
      throw new Error('Review must be between 1 and 1000 characters');
    }
    const post = await getPost(req.params.postId);
    if (!post || !await prisma.classEnrollment.findUnique({
      where: { classroomId_studentId: { classroomId: post.subject.classroomId, studentId: req.user.id } }
    })) {
      res.status(404);
      throw new Error('Revision post not found');
    }
    const review = await prisma.revisionReview.upsert({
      where: { postId_studentId: { postId: post.id, studentId: req.user.id } },
      create: { postId: post.id, studentId: req.user.id, message },
      update: { message }
    });
    res.json({ message: review.message, createdAt: review.createdAt, updatedAt: review.updatedAt });
  } catch (error) {
    next(error);
  }
});

module.exports = router;