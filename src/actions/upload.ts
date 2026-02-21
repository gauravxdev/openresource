"use server";

const UPLOAD_API = "https://image-937.pages.dev/upload";

export async function uploadImage(formData: FormData) {
    try {
        const file = formData.get("file") as File;

        if (!file) {
            return { success: false, message: "No file provided" };
        }

        // Send to external API from server
        const externalFormData = new FormData();
        externalFormData.append("file", file);

        const response = await fetch(UPLOAD_API, {
            method: "POST",
            body: externalFormData,
        });

        if (!response.ok) {
            return { success: false, message: `Upload failed: ${response.statusText}` };
        }

        const data = await response.json() as Array<{ src: string }>;

        if (Array.isArray(data) && data[0]?.src) {
            return {
                success: true,
                url: `https://image-937.pages.dev${data[0].src}`
            };
        } else {
            return { success: false, message: "Invalid response from upload service" };
        }
    } catch (error) {
        console.error("[Upload Action] Error:", error);
        return { success: false, message: "Internal server error during upload" };
    }
}
