"use client";

import { useRef, useState } from "react";
import { X, Share2, Copy, Download } from "lucide-react";
import { renderShareCard } from "@/lib/shareCard";

// A trigger button (its look is up to the caller, via className/children) that
// opens a dialog with the shareable image for `card` — a descriptor from
// lib/milestones.js — rendered on demand in the browser.
//
// Actions adapt to what the device supports:
//   - Web Share API with files (most phones): "Share" opens the native sheet.
//   - Otherwise (most desktops): "Copy image" to the clipboard where allowed.
//   - Always: "Download image", the universal fallback.
// The dialog is the native <dialog> element (Esc / backdrop click / X close it),
// the same pattern as components/NightThemeExplainer.js.
export default function ShareButton({ card, children, className, style, ariaLabel, title }) {
  const dialogRef = useRef(null);
  const urlRef = useRef(null);
  const [phase, setPhase] = useState("idle"); // idle | rendering | ready | error
  const [image, setImage] = useState(null); // { blob, file, url }
  const [caps, setCaps] = useState({ native: false, copy: false });
  const [status, setStatus] = useState("");

  async function open() {
    dialogRef.current?.showModal();
    setStatus("");
    setPhase("rendering");
    try {
      const blob = await renderShareCard(card);
      const file = typeof File === "function" ? new File([blob], card.filename, { type: "image/png" }) : null;
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setImage({ blob, file, url });
      setCaps({
        native: Boolean(file && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })),
        copy: Boolean(navigator.clipboard && navigator.clipboard.write && typeof window.ClipboardItem !== "undefined"),
      });
      setPhase("ready");
    } catch (e) {
      setPhase("error");
    }
  }

  function handleClose() {
    // The native "close" event fires asynchronously; if the dialog was
    // reopened before it landed, this cleanup is stale — don't wipe the
    // state of the dialog that's open now.
    if (dialogRef.current?.open) return;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setImage(null);
    setPhase("idle");
  }

  async function share() {
    try {
      await navigator.share({ files: [image.file], title: "Voco", text: card.shareText });
    } catch (e) {
      // Closing the share sheet is not an error worth reporting.
      if (!e || e.name !== "AbortError") setStatus("Couldn't open the share sheet — try Download instead.");
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.write([new window.ClipboardItem({ "image/png": image.blob })]);
      setStatus("Image copied — paste it anywhere.");
    } catch (e) {
      setStatus("Couldn't copy here — try Download instead.");
    }
  }

  function download() {
    const link = document.createElement("a");
    link.href = image.url;
    link.download = card.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setStatus("Downloading the image…");
  }

  const primary = "w-full rounded-xl px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2";
  const secondary =
    "w-full rounded-xl px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2 border border-[#ffffff26] text-[#EDEBFF]";

  return (
    <>
      <button type="button" onClick={open} className={className} style={style} aria-label={ariaLabel} title={title}>
        {children}
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Share this"
        onClose={handleClose}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current.close();
        }}
        className="m-auto p-0 w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-[#20223F] text-[#EDEBFF] border border-[#ffffff1a] backdrop:bg-[#0B0C1Acc]"
      >
        <div className="p-5 max-h-[92dvh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-xl">Share this</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={() => dialogRef.current?.close()}
              className="p-3.5 -m-3.5 rounded-full text-[#9B97C4] hover:text-[#EDEBFF]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="rounded-xl overflow-hidden bg-[#14152B] mb-4 aspect-[1080/1350]">
            {phase === "ready" && image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image.url} alt={card.shareText} className="w-full h-full block" />
            )}
            {phase === "rendering" && (
              <div className="w-full h-full flex items-center justify-center text-sm text-[#9B97C4]">
                Making your image…
              </div>
            )}
            {phase === "error" && (
              <div className="w-full h-full flex items-center justify-center px-6 text-center text-sm text-[#9B97C4]">
                Couldn't make the image on this device.
              </div>
            )}
          </div>

          {phase === "ready" && image && (
            <div className="space-y-2">
              {caps.native && (
                <button type="button" onClick={share} className={primary} style={{ backgroundColor: "#8B85FF", color: "#14152B" }}>
                  <Share2 size={16} /> Share
                </button>
              )}
              {!caps.native && caps.copy && (
                <button type="button" onClick={copy} className={primary} style={{ backgroundColor: "#8B85FF", color: "#14152B" }}>
                  <Copy size={16} /> Copy image
                </button>
              )}
              <button
                type="button"
                onClick={download}
                className={caps.native || caps.copy ? secondary : primary}
                style={caps.native || caps.copy ? undefined : { backgroundColor: "#8B85FF", color: "#14152B" }}
              >
                <Download size={16} /> Download image
              </button>
            </div>
          )}
          <p className="text-xs text-[#9B97C4] mt-3 min-h-[1rem] text-center" aria-live="polite">
            {status}
          </p>
        </div>
      </dialog>
    </>
  );
}
