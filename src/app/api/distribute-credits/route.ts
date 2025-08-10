import { distributeCreditsToAllUsers } from '@/credits/credits';
import { NextResponse } from 'next/server';

/**
 * distribute credits to all users daily
 */
export async function GET() {
  console.log('distribute credits start');
  const { processedCount, errorCount } = await distributeCreditsToAllUsers();
  console.log(
    `distribute credits end, processed: ${processedCount}, errors: ${errorCount}`
  );
  return NextResponse.json({
    message: `distribute credits success, processed: ${processedCount}, errors: ${errorCount}`,
    processedCount,
    errorCount,
  });
}
