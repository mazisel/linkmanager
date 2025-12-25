import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
    console.log('UPLOAD REQUEST RECEIVED - HEADERS:', Object.fromEntries(request.headers));
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const extension = file.name.split('.').pop();
        const filename = `logo-${uniqueSuffix}.${extension}`;

        // Save to /app/uploads (outside public to avoid caching issues)
        const uploadDir = join(process.cwd(), 'uploads');
        // Ensure directory exists
        try {
            await require('fs/promises').mkdir(uploadDir, { recursive: true });
        } catch (e) { }

        const path = join(uploadDir, filename);

        await writeFile(path, buffer);

        // Return the URL handled by our custom route
        const url = `/uploads/${filename}`;

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('Error uploading file:', error);
        console.error('Upload info:', {
            cwd: process.cwd(),
            errorName: error.name,
            errorMessage: error.message,
            stack: error.stack
        });
        return NextResponse.json({
            error: `Upload failed: ${error.message}`
        }, { status: 500 });
    }
}
