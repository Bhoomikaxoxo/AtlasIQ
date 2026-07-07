import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedSpots } from '../../../../lib/services/destination';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ place: string }> }
) {
  try {
    const { place } = await params;
    const decodedPlace = decodeURIComponent(place);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '40', 10);

    const data = await getPaginatedSpots(decodedPlace, page, pageSize);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Error fetching destination data:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch destination data.' },
      { status: 500 }
    );
  }
}
