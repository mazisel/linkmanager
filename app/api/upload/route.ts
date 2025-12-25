import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
    console.log('UPLOAD: Request received');
    try {
        const session = await auth();
        if (!session?.user?.id) {
            console.log('UPLOAD: Unauthorized');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('UPLOAD: Authorized, parsing form data...');
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.log('UPLOAD: No file found in form data');
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        console.log(`UPLOAD: File received: ${file.name} (${file.size} bytes)`);

        console.log('UPLOAD: Converting to buffer...');
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        console.log('UPLOAD: Buffer created');

        const uploadDir = join(process.cwd(), 'uploads');
        console.log(`UPLOAD: Target directory: ${uploadDir}`);

        try {
            await mkdir(uploadDir, { recursive: true });
            console.log('UPLOAD: Directory check/creation successful');
        } catch (dirError) {
            console.error('UPLOAD: Directory creation warning:', dirError);
        }

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const extension = file.name.split('.').pop() || 'bin';
        const filename = `logo-${uniqueSuffix}.${extension}`;
        const path = join(uploadDir, filename);

        console.log(`UPLOAD: Writing file to ${path}...`);
        await writeFile(path, buffer);
        console.log('UPLOAD: File write successful');

        const url = `/uploads/${filename}`;
        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('UPLOAD: CRITICAL ERROR:', error);
        return NextResponse.json({
            error: `Upload failed: ${error.message}`,
            details: error.stack
        }, { status: 500 });
    }
}
