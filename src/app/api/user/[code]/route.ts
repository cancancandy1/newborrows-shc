import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = params;

  if (!code) {
    return NextResponse.json({ error: "กรุณาระบุรหัส" }, { status: 400 });
  }

  // Fetch from external API
  try {
    const urlService = process.env.SUTSPORT_API_URL || "https://sutsport.sut.ac.th/service/member/code/";
    const token = process.env.SUTSPORT_API_TOKEN || "";
    
    if (!token) {
      console.warn("External API Token not configured.");
      return NextResponse.json({ error: "ไม่พบข้อมูล และยังไม่ได้ตั้งค่า API Token" }, { status: 404 });
    }

    const res = await fetch(`${urlService}${encodeURIComponent(code)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      // cache: 'no-store' // Added so it doesn't cache stale data
    });

    if (res.ok) {
      const data = await res.json();
      if (data.instances && data.instances.length > 0) {
        const instance = data.instances[0];
        
        // Return structured data for the frontend
        return NextResponse.json({
          name: instance.name,
          code: instance.code,
          tel: instance.tel,
          email: instance.email,
          department: instance.actor?.department?.name || "",
          memberType: {
            name: instance.memberType?.name || ""
          }
        });
      }
    }
  } catch (error) {
    console.error("External API Error:", error);
  }

  return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
}
