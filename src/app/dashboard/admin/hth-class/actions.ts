import { db } from '@/db';
import { classes, lessons } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// --- Class Actions ---

export async function createClass(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const teacherId = parseInt(formData.get('teacherId') as string); // Assuming teacherId is passed as a string and needs parsing

  if (!title || !teacherId) {
    throw new Error('Title and Teacher ID are required to create a class.');
  }

  await db.insert(classes).values({
    title,
    description,
    teacherId,
  });

  revalidatePath('/dashboard/admin/hth-class');
}

export async function updateClass(classId: number, formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  if (!title) {
    throw new Error('Title is required to update a class.');
  }

  await db.update(classes)
    .set({
      title,
      description,
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
