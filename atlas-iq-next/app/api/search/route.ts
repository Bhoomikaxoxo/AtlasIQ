import { NextRequest, NextResponse } from 'next/server';
import { geocodePlace } from '../../../lib/services/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required.' },
        { status: 400 }
      );
    }

    const location = await geocodePlace(query);
    return NextResponse.json(location);
  } catch (err: any) {
    console.error('Error geocoding query:', err);
    return NextResponse.json(
      { error: err.message || 'Geocoding failed' },
      { status: 404 }
    );
  }
}
