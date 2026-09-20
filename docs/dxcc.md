# DXCC entities

"Countries worked" is the number every logger shows, and it is not a count of countries. It counts **DXCC entities**, the ARRL's list, where Scotland and England are separate and Sicily is Italy. The UI says countries because that is what operators call it; the data says entities.

## Where the data comes from

The [Amateur Radio Country Files](https://www.country-files.com/), maintained by Jim Reisert, AD1C. MIT licensed, and the notice travels in the generated file.

```bash
npm run sync:cty
```

That downloads the current file, regenerates [`src/domain/dxcc.generated.ts`](../src/domain/dxcc.generated.ts), and prints what it wrote. It is a deliberate command, not part of the build: a logbook that quietly changes what it counted yesterday is worse than one that is a month out of date. Entities change a few times a year.

## What the table holds

| | Count |
|---|---|
| Entities | ~340 |
| Prefixes | ~6,300 |
| Exact callsigns | ~21,000 |

**Exact callsigns are the bulk of it, and they are worth their weight.** They are the callsigns whose prefix says the wrong thing: `9M4SDX` looks Malaysian and operated from the Spratly Islands. Dropping them made the file a quarter of the size and put 13,159 known callsigns in the wrong entity, measured against the file itself, so they stay.

**WAE entities map to their DXCC parent.** The country file lists Sicily, African Italy, Shetland, Bear Island, European Turkey and the Vienna International Centre separately, for the WAE award, each carrying its DXCC parent's number. A contact with `IT9ABC` counts as Italy, which is what DXCC says it is.

## What the log says wins

A contact that carries an ADIF `DXCC` field is counted as that entity, whatever its callsign suggests. The operator was there and a prefix table was not, and a log imported from another program may record an entity this one cannot derive. The field is read on import, written back on export, and never invented: an entity we merely inferred is not the operator's record of what happened, so it is not written into their file.

ADIF uses `DXCC 0` for a contact that is not a DXCC entity. That is a statement about the contact rather than a number to count, so it is preserved as written and left out of the total.

## How a callsign is placed

When there is no recorded entity, the callsign is placed by:

1. The whole callsign, if the file names it explicitly. This wins, because it exists to override the prefix.
2. Otherwise the location part: a prefix wins over the base call, so `F/W1AW` is France. A call area digit or an activity suffix (`/4`, `/P`, `/MM`) says nothing about location, so `W1AW/4` stays in the United States.
3. Longest matching prefix, so `GM0ABC` is Scotland rather than England.

A callsign that matches nothing is left out of the count. A list of countries with an entry called unknown is not a list of countries.

## Size

About 220 kB, and only the statistics page reads it, so it is a separate chunk, kept out of the precache and cached the first time that page is opened. It is not part of the first load.
