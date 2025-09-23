"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { revalidatePath } from "next/cache";

export const toggleStarMarkedPlayground = async (
  playgroundId: string,
  isChecked: boolean
) => {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) throw new Error("Unauthorized");
  try {
    if (isChecked) {
      await db.starMark.create({
        data: {
          userId: userId!,
          playgroundId,
          isMarked: isChecked,
        },
      });
    } else {
      await db.starMark.delete({
        where: {
          userId_playgroundId: {
            userId,
            playgroundId: playgroundId,
          },
        },
      });
    }

    revalidatePath("/dashboard");
    return { success: true, isMarked: isChecked };
  } catch (error) {
    console.error("Error updating problem:", error);
    return { success: false, error: "Failed to update problem" };
  }
};

export const createPlayground = async (data: {
  title: string;
  template: "REACT" | "NEXTJS" | "EXPRESS" | "VUE" | "HONO" | "ANGULAR";
  description?: string;
}) => {
  const user = await currentUser();
  const { title, template, description } = data;
  try {
    if (!user) throw new Error("Unauthorized");
    const newPlayground = await db.playground.create({
      data: {
        title: title,
        description: description,
        template: template,
        userId: user?.id!,
      },
    });
    return newPlayground;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to create playground");
  }
};
export const getAllPlaygroundForUser = async () => {
  const user = await currentUser();
  try {
    if (!user) throw new Error("Unauthorized");
    const playgrounds = await db.playground.findMany({
      where: {
        userId: user?.id!,
        },
       include: {
        user: true,
        starMarks: {
            where: {
                userId: user?.id!
            },
            select: {
                isMarked: true
            }
        }
      },
    }); 
    return playgrounds;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to fetch playgrounds");
  }
};
export const deleteProjectById = async (id: string) => {
  const user = await currentUser();
  try {
    if (!user) throw new Error("Unauthorized");
    const deletedProject = await db.playground.deleteMany({
      where: {
        id: id,
        userId: user?.id!,
      },
    });
    revalidatePath("/dashboard");
  } catch (error) {
    console.log(error);
    throw new Error("Failed to delete project");
  }
};
export const editProjectById = async (
  id: string,
  data: { title: string; description: string }
) => {
  const user = await currentUser();
  try {
    if (!user) throw new Error("Unauthorized");
    const updatedProject = await db.playground.updateMany({
      where: {
        id: id,
        userId: user?.id!,
      },
      data: data,
    });
    revalidatePath("/dashboard");
  } catch (error) {
    console.log(error);
    throw new Error("Failed to update project");
  }
};
export const duplicateProjectById = async (id: string) => {
  const user = await currentUser();
  try {
    if (!user) throw new Error("Unauthorized");
    const project = await db.playground.findFirst({
      where: {
        id: id,
        userId: user?.id!,
      },
    });
    if (!project) throw new Error("Project not found");
    const newProject = await db.playground.create({
      data: {
        title: project.title + " (Copy)",
        description: project.description,
        template: project.template,
        userId: project.userId,
        //todo add template files
      },
    });
    revalidatePath("/dashboard");
    return newProject;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to duplicate project");
  }
};
