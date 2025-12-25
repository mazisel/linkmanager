import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import mime from 'mime';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ filename: string }> }
) {
    console.log('GET IMAGE: Request received');
    try {
        const { filename } = await params;
        console.log(`GET IMAGE: Requested filename: ${filename}`);

        const filePath = join(process.cwd(), 'uploads', filename);
        console.log(`GET IMAGE: Looking for file at ${filePath}`);

        if (!existsSync(filePath)) {
            console.error('GET IMAGE: File not found on disk');
            return new NextResponse('File not found', { status: 404 });
        }

        console.log('GET IMAGE: File exists, reading...');
        const fileBuffer = await readFile(filePath);
        console.log(`GET IMAGE: Read ${fileBuffer.length} bytes`);

        const contentType = mime.getType(filePath) || 'application/octet-stream';
        console.log(`GET IMAGE: Content-Type determined: ${contentType}`);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('GET IMAGE: Error serving file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
