import moment from 'moment-timezone';
import { DayOneImporterSettings } from './main';
import { DayOneItem } from './schema';
import { normalizePath } from 'obsidian';
import { ZodError } from 'zod';

export function buildFileName(
	settings: DayOneImporterSettings,
	item: DayOneItem
) {
	let fileName = '';

	if (settings.dateBasedFileNames) {
		const dateSettings = item.isAllDay
			? settings.dateBasedAllDayFileNameFormat
			: settings.dateBasedFileNameFormat;

		let date = moment(item.creationDate);

		if (item.timeZone) {
			date = date.tz(item.timeZone);
		} else if (item.location?.timeZoneName) {
			date = date.tz(item.location.timeZoneName);
		}

		fileName = date.format(dateSettings);
	} else {
		fileName = item.uuid;
	}

	if (settings.appendEntryTitleToFileName) {
		fileName = `${fileName} - ${getTitle(item)}`;
	}

	return normalizePath(`${fileName}.md`);
}

function getTitle(item: DayOneItem): string {
	const match = item.text.match(/^# (.+)\s/);
	return match ? match[1] : '';
}

export type ImportFailure = { entry: DayOneItem; reason: string };
export type ImportInvalidEntry = {
	entryId?: string;
	creationDate?: string;
	reason: ZodError;
};

export type ImportResult = {
	total: number;
	successCount: number;
	ignoreCount: number;
	failures: ImportFailure[];
	invalidEntries: ImportInvalidEntry[];
};
