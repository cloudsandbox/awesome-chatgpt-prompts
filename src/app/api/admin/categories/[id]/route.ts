import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isIconUsed } from "@/lib/icons";

// Update category
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, icon, parentId, pinned } = body;

    // If icon is being changed, validate uniqueness
    if (icon) {
      const currentCategory = await db.category.findUnique({
        where: { id },
        select: { icon: true },
      });

      // Only check uniqueness if the icon is different from current
      if (currentCategory?.icon !== icon) {
        const existingCategories = await db.category.findMany({
          select: { icon: true },
        });
        const usedIcons = existingCategories.map((c) => c.icon);

        if (isIconUsed(icon, usedIcons, currentCategory?.icon)) {
          return NextResponse.json(
            { error: `Icon "${icon}" is already used by another category. Please choose a different icon.` },
            { status: 400 }
          );
        }
      }
    }

    const category = await db.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        description: description ?? undefined,
        icon: icon ?? undefined,
        parentId: parentId === null ? null : (parentId || undefined),
        ...(typeof pinned === "boolean" && { pinned }),
      },
    });

    revalidateTag("categories", "max");

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check for prompts using this category
    const promptCount = await db.prompt.count({
      where: { categoryId: id },
    });

    if (promptCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category: ${promptCount} prompt${promptCount === 1 ? '' : 's'} use this category. Move or delete them first.`
        },
        { status: 400 }
      );
    }

    // Check for subcategories
    const childCount = await db.category.count({
      where: { parentId: id },
    });

    if (childCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category: ${childCount} subcategory${childCount === 1 ? '' : 'ies'} exist. Delete or reassign them first.`
        },
        { status: 400 }
      );
    }

    await db.category.delete({
      where: { id },
    });

    revalidateTag("categories", "max");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
