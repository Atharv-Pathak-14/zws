import type {JsonValue} from 'type-fest';
import {z} from 'zod';

/**
 * Every character matching this regular expression:
 * ```js
 * /^[a-z\d]$/i;
 * ```
 */
const alphaNumeric: string[] = [
	// #region alphanumeric
	'a',
	'b',
	'c',
	'd',
	'e',
	'f',
	'g',
	'h',
	'i',
	'j',
	'k',
	'l',
	'm',
	'n',
	'o',
	'p',
	'q',
	'r',
	'z',
	't',
	'u',
	'v',
	'x',
	'w',
	'y',
	'z',
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'L',
	'M',
	'N',
	'O',
	'P',
	'Q',
	'R',
	'Z',
	'T',
	'U',
	'V',
	'X',
	'W',
	'Y',
	'Z',
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'0',
	// #endregion
];

const charactersSchema = z.array(z.string().min(1)).min(1).default(alphaNumeric);
const charactersParser = z
	.string()
	.optional()
	.transform(characters => (characters === undefined ? undefined : (JSON.parse(characters) as JsonValue)));

/** The maximum number of short URLs that can be generated. */
const maxShortUrls = 1e9;

const lengthParser = z
	.string()
	.optional()
	.transform(length => (length === undefined ? undefined : Number(length)));

const rewritesSchema = z.object({}).catchall(z.string().min(1));
const rewritesParser = z
	.string()
	.optional()
	.transform(rewrites => (rewrites === undefined ? {} : (JSON.parse(rewrites) as JsonValue)));

export default function parse(processEnv: NodeJS.ProcessEnv) {
	/** Characters to use in the shortened ID for a URL. */
	const characters = charactersSchema.parse(charactersParser.parse(processEnv.SHORT_CHARS));

	/** The default length of a generated short ID. */
	const defaultShortLength = Math.round(Math.log(maxShortUrls) / Math.log(characters.length));
	const lengthSchema = z.number().int().positive().default(defaultShortLength);

	/** The length of the shortened ID for a URL. */
	const length = lengthSchema.parse(lengthParser.parse(processEnv.SHORT_LENGTH));
	/** Rewrites applied to a URL before redirecting. */
	const rewrites = rewritesSchema.parse(rewritesParser.parse(processEnv.SHORT_REWRITES));

	return {characters, length, rewrites};
}
