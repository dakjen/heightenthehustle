import { db } from '@/db';
import { classes, lessons, classTypeEnum, users, enrollments, enrollmentStatusEnum } from '@/db/schema'; // Added enrollments, enrollmentStatusEnum
import { eq, or, and } from 'drizzle-orm'; // Added and
import { revalidatePath } from 'next/cache';

// --- Class Actions ---

export async function createClass(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const teacherId = parseInt(formData.get('teacherId') as string);
  const type = formData.get('type') as 'pre-course' | 'hth-course';
  const syllabusUrl = formData.get('syllabusUrl') as string | null; // New syllabusUrl field

  if (!title || !teacherId || !type) {
    throw new Error('Title, Teacher ID, and Type are required to create a class.');
  }

  await db.insert(classes).values({
    title,
    description,
    teacherId,
    type,
    syllabusUrl, // Added syllabusUrl
  });

  revalidatePath('/dashboard/admin/hth-class');
}

export async function updateClass(classId: number, formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const type = formData.get('type') as 'pre-course' | 'hth-course';
  const syllabusUrl = formData.get('syllabusUrl') as string | null; // New syllabusUrl field

  if (!title || !type) {
    throw new Error('Title and Type are required to update a class.');
  }

  await db.update(classes)
    .set({
      title,
      description,
      type,
      syllabusUrl, // Added syllabusUrl
      updatedAt: new Date(),
    })
    .where(eq(classes.id, classId));

  revalidatePath('/dashboard/admin/hth-class');
  revalidatePath(`/dashboard/admin/hth-class/edit-class/${classId}`);
}

export async function deleteClass(classId: number) {
  await db.delete(classes).where(eq(classes.id, classId));
  revalidatePath('/dashboard/admin/hth-class');
}

export async function getClassById(classId: number) {
  const classItem = await db.query.classes.findFirst({
    where: eq(classes.id, classId),
  });
  return classItem;
}

export async function getAllClasses() {
  const allClasses = await db.query.classes.findMany();
  return allClasses;
}

// --- Lesson Actions ---

export async function createLesson(formData: FormData) {
  const classId = parseInt(formData.get('classId') as string);
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const order = parseInt(formData.get('order') as string);

  if (!classId || !title || !order) {
    throw new Error('Class ID, Title, and Order are required to create a lesson.');
  }

  await db.insert(lessons).values({
    classId,
    title,
    content,
    order,
  });

  revalidatePath('/dashboard/admin/hth-class');
  revalidatePath(`/dashboard/admin/hth-class/edit-class/${classId}`);
}

export async function updateLesson(lessonId: number, formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const order = parseInt(formData.get('order') as string);

  if (!title || !order) {
    throw new Error('Title and Order are required to update a lesson.');
  }

  await db.update(lessons)
    .set({
      title,
      content,
      order,
      updatedAt: new Date(),
    })
    .where(eq(lessons.id, lessonId));

  revalidatePath('/dashboard/admin/hth-class');
  // Revalidate paths for any class that might contain this lesson
  // This might need to be more specific if lessons can belong to multiple classes
  revalidatePath(`/dashboard/admin/hth-class/edit-lesson/${lessonId}`);
}

export async function deleteLesson(lessonId: number) {
  await db.delete(lessons).where(eq(lessons.id, lessonId));
  revalidatePath('/dashboard/admin/hth-class');
}

export async function getLessonById(lessonId: number) {
  const lessonItem = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
  });
  return lessonItem;
}

export async function getLessonsByClassId(classId: number) {
  const classLessons = await db.query.lessons.findMany({
    where: eq(lessons.classId, classId),
    orderBy: lessons.order,
  });
  return classLessons;
}

export async function getInternalAndAdminUsers() {
  const internalAndAdminUsers = await db.query.users.findMany({
    where: or(eq(users.role, 'admin'), eq(users.role, 'internal')),
    columns: {
      id: true,
      name: true,
    },
  });
  return internalAndAdminUsers;
}

// --- Enrollment Actions ---

export async function requestEnrollment(userId: number, classId: number) {
  // Check if already enrolled or pending
  const existingEnrollment = await db.query.enrollments.findFirst({
    where: and(eq(enrollments.userId, userId), eq(enrollments.classId, classId)),
  });

  if (existingEnrollment) {
    if (existingEnrollment.status === 'enrolled') {
      throw new Error('User is already enrolled in this class.');
    }
    if (existingEnrollment.status === 'pending') {
      throw new Error('Enrollment request for this class is already pending.');
    }
  }

  await db.insert(enrollments).values({
    userId,
    classId,
    status: 'pending', // Default to pending for requests
  });

  revalidatePath(`/dashboard/admin/hth-class/enrollment-requests`); // Revalidate admin requests page
  revalidatePath(`/dashboard/hth-class`); // Revalidate user class list
}

export async function acceptEnrollment(enrollmentId: number) {
  await db.update(enrollments)
    .set({ status: 'enrolled' })
    .where(eq(enrollments.id, enrollmentId));

  revalidatePath(`/dashboard/admin/hth-class/enrollment-requests`);
  revalidatePath(`/dashboard/hth-class`);
  // Revalidate class detail page if needed
}

export async function rejectEnrollment(enrollmentId: number) {
  await db.update(enrollments)
    .set({ status: 'rejected' })
    .where(eq(enrollments.id, enrollmentId));

  revalidatePath(`/dashboard/admin/hth-class/enrollment-requests`);
  revalidatePath(`/dashboard/hth-class`);
  // Revalidate class detail page if needed
}

export async function getPendingEnrollments() {
  const pendingRequests = await db.query.enrollments.findMany({
    where: eq(enrollments.status, 'pending'),
    with: {
      user: {
        columns: { id: true, name: true, email: true },
      },
      class: {
        columns: { id: true, title: true },
      },
    },
  });
  return pendingRequests;
}

export async function getEnrolledUsersForClass(classId: number) {
  const enrolledUsers = await db.query.enrollments.findMany({
    where: and(eq(enrollments.classId, classId), eq(enrollments.status, 'enrolled')),
    with: {
      user: {
        columns: { id: true, name: true, email: true },
      },
    },
  });
  return enrolledUsers;
}

export async function getClassesForUser(userId: number) {
  const userEnrollments = await db.query.enrollments.findMany({
    where: eq(enrollments.userId, userId),
    with: {
      class: {
        columns: { id: true, title: true, description: true, type: true, syllabusUrl: true },
      },
    },
  });
  return userEnrollments;
}
