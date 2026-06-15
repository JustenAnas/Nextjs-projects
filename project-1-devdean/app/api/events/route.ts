import { v2 as cloudinary } from "cloudinary";
import Event from "@/database/event.model";
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries());
        } catch (error) {
            return NextResponse.json({
                message: "Invalid form data"
            }, { status: 400 }) // 400 = client sent bad data
        }

        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({
                message: "Image file is required"
            }, { status: 400 })
        }

        let tags = JSON.parse(formData.get('tags') as string);
        let agenda = JSON.parse(formData.get('agenda') as string);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload image to Cloudinary under the DevDean project folder
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: "image", folder: 'DevDean' }, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            }).end(buffer);
        });

        event.image = (uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
        });

        return NextResponse.json({
            message: "Event created successfully",
            event: createdEvent
        }, { status: 201 })

    } catch (error) {
        console.log(error);
        // 500 = server-side failure (not the client's fault)
        return NextResponse.json({
            message: "Event creation failed",
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 })
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({
            message: "Events fetched successfully",
            events: events
        }, { status: 200 })

    } catch (error) {
        // 500 = server-side failure (not the client's fault)
        return NextResponse.json({
            message: "Failed to fetch events",
            error: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 })
    }
}