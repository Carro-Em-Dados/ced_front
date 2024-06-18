import { NextResponse } from 'next/server'
 
export async function GET() {
    return NextResponse.json({"message": "Carro em Dados API - 2024"}, {status:200})
}