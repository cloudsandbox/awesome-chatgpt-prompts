import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getNextAvailableIcon, isIconUsed } from "@/lib/icons";

// Create category
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, icon, parentId, pinned } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    // Get all existing category icons
    const existingCategories = await db.category.findMany({
      select: { icon: true },
    });
    const usedIcons = existingCategories.map((c) => c.icon);

    // Auto-assign an icon if not provided, or validate uniqueness if provided
    let assignedIcon = icon;
    if (!assignedIcon) {
      assignedIcon = getNextAvailableIcon(usedIcons);
    } else if (isIconUsed(assignedIcon, usedIcons)) {
      return NextResponse.json(
        { error: `Icon "${assignedIcon}" is already used by another category. Please choose a different icon.` },
        { status: 400 }
      );
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description: description || null,
        icon: assignedIcon,
        parentId: parentId || null,
        pinned: pinned || false,
      },
    });

    revalidateTag("categories", "max");

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
