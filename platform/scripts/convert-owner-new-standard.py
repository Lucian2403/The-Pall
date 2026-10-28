#!/usr/bin/env python3
"""Convert the owner's original New Standard OTF into browser-safe WOFF2.

The supplied OpenType/CFF file is rejected by Chromium's OTS parser
(CFF CharStrings INDEX). Simply repackaging the CFF into WOFF2 will NOT
repair it. These steps redraw CFF outlines as TrueType quadratic outlines.
Only the owner's locally supplied font is read; no font binaries are shipped
with this repository or this script.

Requires: python -m pip install fonttools brotli
Usage: python scripts/convert-owner-new-standard.py input.otf output.woff2
License: Original New Standard is SIL OFL 1.1. Retain its OFL notice.
"""
import sys
from pathlib import Path

try:
    from fontTools.ttLib import TTFont, newTable
    from fontTools.pens.ttGlyphPen import TTGlyphPen
    from fontTools.pens.cu2quPen import Cu2QuPen
except ImportError as error:
    raise SystemExit(
        "Missing conversion tools. Install once with: "
        "py -3 -m pip install fonttools brotli"
    ) from error


def convert(source: Path, destination: Path) -> None:
    font = TTFont(str(source))
    if "CFF " not in font:
        raise ValueError("The supplied New Standard font must contain CFF outlines")
    glyph_set = font.getGlyphSet()
    names = font.getGlyphOrder()
    glyphs = {}
    for glyph_name in names:
        pen = TTGlyphPen(glyph_set)
        quadratic = Cu2QuPen(pen, max_err=1.0, reverse_direction=True)
        glyph_set[glyph_name].draw(quadratic)
        glyphs[glyph_name] = pen.glyph()

    font.sfntVersion = "\x00\x01\x00\x00"
    glyf = newTable("glyf")
    glyf.glyphs = glyphs
    glyf.glyphOrder = names
    font["glyf"] = glyf
    font["loca"] = newTable("loca")

    maxp = font["maxp"]
    maxp.tableVersion = 0x10000
    for attr in (
        "maxPoints", "maxContours", "maxCompositePoints", "maxCompositeContours",
        "maxTwilightPoints", "maxStorage", "maxFunctionDefs", "maxInstructionDefs",
        "maxStackElements", "maxSizeOfInstructions", "maxComponentElements",
        "maxComponentDepth"
    ):
        setattr(maxp, attr, 0)
    maxp.maxZones = 2
    font["post"].formatType = 3.0
    font["head"].glyphDataFormat = 0
    font["head"].indexToLocFormat = 1
    del font["CFF "]

    # Modified font: identify it distinctly from the owner's source file.
    # SIL OFL's Reserved Font Name "Walleye" is not used.
    for record in font["name"].names:
        if record.nameID in (1, 4, 16):
            record.string = "Pall New Standard".encode(record.getEncoding())
        elif record.nameID in (2, 17):
            record.string = "Regular".encode(record.getEncoding())
        elif record.nameID == 6:
            record.string = "PallNewStandard-Regular".encode(record.getEncoding())

    font.recalcBBoxes = True
    font.recalcTimestamp = False
    font.flavor = "woff2"
    destination.parent.mkdir(parents=True, exist_ok=True)
    font.save(str(destination))
    font.close()

    check = TTFont(str(destination))
    assert "glyf" in check and "CFF " not in check
    assert all(ord(char) in check.getBestCmap() for char in "abcdefghijklmnopqrstuvwxyz0123456789")
    check.close()
    print(f"Converted the owner's New Standard to validated TrueType-outline WOFF2: {destination}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: convert-owner-new-standard.py INPUT.otf OUTPUT.woff2")
    convert(Path(sys.argv[1]), Path(sys.argv[2]))
