"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { findGuide } from "@/lib/wordbanks";
import { guideReadingMinutes } from "@/lib/satStrategy";

function Block({ block }) {
  switch (block.type) {
    case "heading":
      return <h2 className="font-display text-xl text-[#EDEBFF] pt-3">{block.text}</h2>;
    case "paragraph":
      return <p className="text-[16px] leading-[1.7] text-[#CFCBEE]">{block.text}</p>;
    case "list":
      return (
        <ul className="space-y-3 list-disc pl-5 marker:text-[#8B85FF]">
          {block.items.map((item, i) => (
            <li key={i} className="text-[16px] leading-[1.7] text-[#CFCBEE]">
              {item}
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="space-y-3 list-decimal pl-5 marker:text-[#8B85FF] marker:font-medium">
          {block.items.map((item, i) => (
            <li key={i} className="text-[16px] leading-[1.7] text-[#CFCBEE]">
              {item}
            </li>
          ))}
        </ol>
      );
    case "example":
      return (
        <div className="rounded-2xl bg-[#20223F] border-l-4 border-[#8B85FF] p-4">
          <p className="text-xs uppercase tracking-wide text-[#8B85FF] mb-2">{block.label}</p>
          <p className="text-[15px] leading-[1.7] text-[#CFCBEE]">{block.text}</p>
        </div>
      );
    default:
      return null;
  }
}

// One written strategy guide (lib/satStrategy.js). Free to everyone: there is
// no subscription check and nothing here is recorded — reading a guide changes
// no progress, streak or milestone.
export default function StrategyGuidePage() {
  const params = useParams();
  const router = useRouter();
  const found = findGuide(params.guideId);

  useEffect(() => {
    if (!found) router.replace("/");
  }, [found, router]);

  if (!found) return null;
  const { course, guide } = found;
  const backHref = `/courses/${course.id}?section=strategy`;

  return (
    <main className="min-h-dvh bg-[#1A1C3A] px-4 py-8">
      <div className="max-w-md mx-auto">
        <Link href={backHref} className="flex items-center gap-1 text-xs text-[#9B97C4] mb-6">
          <ArrowLeft size={14} /> Back
        </Link>

        <p className="text-xs uppercase tracking-wide text-[#9B97C4] mb-1">
          {course.title} · Strategy · {guideReadingMinutes(guide)} min read
        </p>
        <h1 className="font-display text-2xl text-[#EDEBFF] mb-6">{guide.title}</h1>

        <div className="space-y-4">
          {guide.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        <div className="mt-8 flex gap-2">
          <Link
            href={backHref}
            className="flex-1 text-center text-sm rounded-xl px-3 py-2 border border-[#9B97C455] text-[#EDEBFF]"
          >
            All guides
          </Link>
          <Link
            href={`/courses/${course.id}?section=passages`}
            className="flex-1 text-center text-sm rounded-xl px-3 py-2 font-medium"
            style={{ backgroundColor: "#8B85FF", color: "#14152B" }}
          >
            Try a passage
          </Link>
        </div>
      </div>
    </main>
  );
}
