// Simple test API route to verify basic functionality
export async function GET() {
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: "Test API route is working",
      timestamp: new Date().toISOString()
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}