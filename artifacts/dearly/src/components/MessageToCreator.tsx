import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { PaperSurface } from "@/components/PaperSurface";
import { WaxSeal } from "@/components/WaxSeal";
import { paperTheme } from "@/lib/paper-theme";
import { DUR, EASE, SPRING } from "@/lib/motion";

/**
 * Where notes go. Set one of these in `.env` (or Vercel's env settings):
 *
 *   VITE_DEARLY_FORM_ENDPOINT — a Formspree / Basin / serverless URL, posted as JSON
 *   VITE_DEARLY_EMAIL         — opens the reader's mail client instead
 *
 * With neither set the note is copied to the clipboard, so a message is never
 * silently swallowed.
 */
const FORM_ENDPOINT: string = import.meta.env.VITE_DEARLY_FORM_ENDPOINT ?? "";
const CREATOR_EMAIL: string = import.meta.env.VITE_DEARLY_EMAIL ?? "";

type Status = "idle" | "sending" | "sealed" | "copied";

export function MessageToCreator({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const reduceMotion = useReducedMotion();
  const theme = paperTheme("cream");
  const noteRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setTimeout(() => noteRef.current?.focus(), 350);
    else setTimeout(() => setStatus("idle"), 300);
  }, [open]);

  const canSend = note.trim().length > 1 && status === "idle";

  const handleSend = async () => {
    if (!canSend) return;
    setStatus("sending");

    const from = name.trim() || "someone";
    const body = `${note.trim()}\n\n— ${from}${contact.trim() ? ` (${contact.trim()})` : ""}`;

    try {
      if (FORM_ENDPOINT) {
        const response = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ name: from, contact: contact.trim(), message: note.trim() }),
        });
        if (!response.ok) throw new Error(`Form endpoint returned ${response.status}`);
        setStatus("sealed");
        return;
      }

      if (CREATOR_EMAIL) {
        const subject = encodeURIComponent(`A note from ${from} · Dearly`);
        window.location.href = `mailto:${CREATOR_EMAIL}?subject=${subject}&body=${encodeURIComponent(body)}`;
        setStatus("sealed");
        return;
      }

      await navigator.clipboard.writeText(body);
      setStatus("copied");
    } catch (err) {
      console.error("Could not send the note", err);
      try {
        await navigator.clipboard.writeText(body);
        setStatus("copied");
      } catch {
        setStatus("idle");
      }
    }
  };

  const sent = status === "sealed" || status === "copied";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.fast }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#160f14]/55 backdrop-blur-sm"
          />

          <motion.div
            key="note"
            role="dialog"
            aria-modal="true"
            aria-label="Leave a note for the maker"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.96, rotate: -1.2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: DUR.base, ease: EASE }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <PaperSurface
              background="cream"
              creaseOpacity={0.45}
              className="pointer-events-auto w-full max-w-md rounded-[18px] shadow-[0_30px_70px_rgba(40,20,15,0.35)]"
            >
              <button
                onClick={onClose}
                className="absolute right-3 top-3 z-20 p-2 rounded-full hover:bg-black/5 transition-colors"
                style={{ color: theme.inkSoft }}
                aria-label="Close"
              >
                <X size={15} />
              </button>

              <div className="relative z-10 px-7 pt-8 pb-7 sm:px-9">
                <AnimatePresence mode="wait">
                  {!sent ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: DUR.fast }}
                    >
                      <p
                        className="font-cormorant text-[10px] uppercase tracking-[0.3em] mb-1.5"
                        style={{ color: theme.inkSoft }}
                      >
                        a note to the maker
                      </p>
                      <h2
                        className="font-dancing text-4xl mb-1 leading-tight"
                        style={{ color: theme.ink }}
                      >
                        Say something?
                      </h2>
                      <p
                        className="font-cormorant italic text-base mb-6"
                        style={{ color: theme.inkSoft }}
                      >
                        Dearly was made by hand. If it meant something to you, I'd love to know.
                      </p>

                      <label htmlFor="note-body" className="sr-only">
                        Your note
                      </label>
                      <textarea
                        id="note-body"
                        ref={noteRef}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={4}
                        placeholder="I wrote one for my mum and she cried…"
                        className="paper-input w-full bg-transparent resize-none outline-none font-cormorant text-lg leading-relaxed border-b pb-2 mb-5 transition-colors"
                        style={{ borderColor: `${theme.ink}22` }}
                      />

                      <div className="grid grid-cols-2 gap-3 mb-7">
                        <div>
                          <label
                            htmlFor="note-name"
                            className="block font-cormorant text-[10px] uppercase tracking-[0.2em] mb-1"
                            style={{ color: theme.inkSoft }}
                          >
                            your name
                          </label>
                          <input
                            id="note-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="paper-input w-full bg-transparent outline-none font-cormorant text-base border-b pb-1"
                            style={{ borderColor: `${theme.ink}1a` }}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="note-contact"
                            className="block font-cormorant text-[10px] uppercase tracking-[0.2em] mb-1"
                            style={{ color: theme.inkSoft }}
                          >
                            reply to <span className="normal-case tracking-normal">(optional)</span>
                          </label>
                          <input
                            id="note-contact"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            className="paper-input w-full bg-transparent outline-none font-cormorant text-base border-b pb-1"
                            style={{ borderColor: `${theme.ink}1a` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span
                          className="font-cormorant italic text-xs"
                          style={{ color: theme.inkSoft }}
                        >
                          {status === "sending" ? "sealing…" : "press the seal to send"}
                        </span>

                        <motion.button
                          onClick={handleSend}
                          disabled={!canSend}
                          whileHover={canSend && !reduceMotion ? { scale: 1.06, rotate: -3 } : undefined}
                          whileTap={canSend && !reduceMotion ? { scale: 0.88 } : undefined}
                          transition={SPRING.crisp}
                          className="rounded-full disabled:opacity-35 disabled:cursor-not-allowed transition-opacity"
                          aria-label="Send your note"
                        >
                          <WaxSeal size={56} colors={theme.wax} monogram="✉" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sealed"
                      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: DUR.base, ease: EASE }}
                      className="py-6 text-center"
                    >
                      <motion.div
                        className="inline-block mb-5"
                        initial={reduceMotion ? false : { scale: 0.4, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={SPRING.crisp}
                      >
                        <WaxSeal size={76} colors={theme.wax} monogram="D" />
                      </motion.div>

                      <h2 className="font-dancing text-4xl mb-2" style={{ color: theme.ink }}>
                        {status === "copied" ? "Copied to your clipboard" : "Sealed and sent"}
                      </h2>
                      <p
                        className="font-cormorant italic text-base mb-6 max-w-xs mx-auto"
                        style={{ color: theme.inkSoft }}
                      >
                        {status === "copied"
                          ? "No inbox is wired up yet — your note is on the clipboard, ready to paste wherever you like."
                          : "Thank you for taking the time. It genuinely means a lot."}
                      </p>

                      <button
                        onClick={onClose}
                        className="font-cormorant text-xs uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
                        style={{ color: theme.inkSoft }}
                      >
                        close
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </PaperSurface>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
