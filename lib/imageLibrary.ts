export type LibImage = { id: string; name: string; dataUrl: string };

const KEY = "image-library";
const MAX_W = 800;

export function loadLibrary(): LibImage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const j = raw ? JSON.parse(raw) : [];
    return Array.isArray(j) ? j : [];
  } catch { return []; }
}

function persist(items: LibImage[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("image-library-changed"));
  } catch {
    alert("คลังรูปเต็ม (เบราว์เซอร์จำได้ ~5MB) ลบรูปเก่าออกบ้าง");
  }
}

export function addLibraryImage(name: string, dataUrl: string) {
  const items = [{ id: "IMG" + Date.now(), name, dataUrl }, ...loadLibrary()];
  persist(items);
  return items;
}

export function removeLibraryImage(id: string) {
  persist(loadLibrary().filter((x) => x.id !== id));
}

// ย่อรูปก่อนเก็บ กัน localStorage เต็ม (กว้างสุด 800px)
export function fileToDataUrl(file: File): Promise<{ name: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          const scale = Math.min(1, MAX_W / img.width);
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const cv = document.createElement("canvas");
          cv.width = w; cv.height = h;
          cv.getContext("2d")?.drawImage(img, 0, 0, w, h);
          resolve({ name: file.name, dataUrl: cv.toDataURL("image/jpeg", 0.82) });
        } catch (e) { reject(e); }
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
