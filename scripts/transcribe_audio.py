from __future__ import annotations

import json
import sys
from pathlib import Path

from faster_whisper import WhisperModel


def main() -> int:
    if len(sys.argv) < 3:
        print("usage: transcribe_audio.py <audio_path> <output_dir> [model_size]", file=sys.stderr)
        return 2

    audio_path = Path(sys.argv[1]).expanduser().resolve()
    output_dir = Path(sys.argv[2]).expanduser().resolve()
    model_size = sys.argv[3] if len(sys.argv) > 3 else "small"
    output_dir.mkdir(parents=True, exist_ok=True)

    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segments, info = model.transcribe(
        str(audio_path),
        beam_size=5,
        vad_filter=True,
        word_timestamps=False,
        condition_on_previous_text=False,
    )

    segment_rows = []
    for segment in segments:
        segment_rows.append(
            {
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip(),
            }
        )

    (output_dir / "transcript.json").write_text(
        json.dumps(
            {
                "audio_path": str(audio_path),
                "detected_language": info.language,
                "language_probability": info.language_probability,
                "duration": info.duration,
                "segments": segment_rows,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    (output_dir / "transcript.txt").write_text(
        "\n".join(row["text"] for row in segment_rows),
        encoding="utf-8",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
