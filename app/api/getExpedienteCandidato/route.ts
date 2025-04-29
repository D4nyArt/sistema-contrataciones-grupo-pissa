import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
      // const {candidato} = await request.json(); // Leer el cuerpo de la solicitud
  
      return NextResponse.json({ message: 'Email sent successfully'});
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  }