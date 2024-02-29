"use client";
import { useState } from "react";
import Image from "next/image";
import videoImage from "../../public/video-img.png";
import throttle from "lodash.throttle";

export default function Home() {
  const [progress, setProgress] = useState<number>(0);

  const updateProgress = throttle(
    (value: number) => {
      setProgress(value);
    },
    100,
    { leading: true, trailing: true },
  );

  async function handleOnClick() {
    const response = await fetch(
      "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    );

    if (!response?.body) return;

    const contentLength = response.headers.get("Content-Length");
    const totalLength =
      typeof contentLength === "string" && parseInt(contentLength);

    const reader = response.body.getReader();
    const chunks = [];
    let receivedLength = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log("done");
        break;
      }

      chunks.push(value);

      receivedLength += value.length;
      if (typeof totalLength === "number") {
        const step =
          parseFloat((receivedLength / totalLength).toFixed(2)) * 100;
        setProgress(step);
      }
    }

    const blob = new Blob(chunks);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "file.mp4";

    function handleOnDownload() {
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.removeEventListener("click", handleOnDownload);
      }, 150);
    }

    a.addEventListener("click", handleOnDownload, false);

    a.click();
  }
  return (
    <div className="max-w-xl my-0 mx-auto px-4">
      <Image
        className="rounded mb-2"
        width="600"
        height="338"
        src={videoImage}
        alt=""
      />
      <h2 className="font-bold text-lg mb-6">
        Warn Users When Leaving a Page in React with beforeunload
      </h2>
      <div className="flex items-center gap-4 w-full">
        <p>
          <button
            className="text-white font-bold bg-blue-500"
            onClick={handleOnClick}
          >
            Download
          </button>
        </p>
        <p className="grow">
          <span className="block relative h-6 w-full rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-600">
            <span
              className={`block absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 ${
                progress < 100 ? "animate-pulse" : ""
              }`}
              style={{ left: `-${100 - progress}%` }}
            />
          </span>
          <span className="block text-xs font-bold mt-1">
            {progress?.toFixed()}% complete
          </span>
        </p>
      </div>
    </div>
  );
}
