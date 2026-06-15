import type { MemorialBook, Message, Moment, FutureLetter } from '@/types';
import { formatDateCN, daysBetween } from './date';
import { loadImage, drawRoundedRect, wrapText } from './image';
import { MOOD_OPTIONS, MOMENT_TYPE_OPTIONS, isLetterUnlocked } from '@/types';

interface GenerateLongImageOptions {
  book: MemorialBook;
  messages: Message[];
  moments: Moment[];
  letters?: FutureLetter[];
  onProgress?: (progress: number) => void;
}

const CANVAS_WIDTH = 750;
const PADDING = 40;
const CONTENT_WIDTH = CANVAS_WIDTH - PADDING * 2;

export async function generateLongImage({
  book,
  messages,
  moments,
  onProgress,
}: GenerateLongImageOptions): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  const topMessages = [...messages]
    .filter((m) => m.isApproved)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);

  const selectedMoments = moments.slice(0, 6);

  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d')!;
  const momentHeights = selectedMoments.map((m) => calcMomentItemHeight(measureCtx, m));
  const timelineTotalHeight = momentHeights.reduce((sum, h) => sum + h, 0) + (selectedMoments.length - 1) * 20;

  let totalHeight = 0;
  totalHeight += 320;
  totalHeight += 60;
  totalHeight += topMessages.length * 160 + 40;
  totalHeight += 60;
  totalHeight += timelineTotalHeight + 60;
  totalHeight += 180;
  totalHeight += 120;

  canvas.width = CANVAS_WIDTH;
  canvas.height = totalHeight;

  const gradient = ctx.createLinearGradient(0, 0, 0, totalHeight);
  gradient.addColorStop(0, '#FFF8F3');
  gradient.addColorStop(1, '#FFEFE0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, totalHeight);

  let y = 0;

  y = await drawHeader(ctx, book, y);
  onProgress?.(0.2);

  y = drawMessagesSection(ctx, topMessages, y + 40);
  onProgress?.(0.5);

  y = drawTimelineSection(ctx, selectedMoments, y + 40);
  onProgress?.(0.8);

  drawFooter(ctx, book, messages, y + 40);
  onProgress?.(1);

  return canvas.toDataURL('image/jpeg', 0.85);
}

async function drawHeader(
  ctx: CanvasRenderingContext2D,
  book: MemorialBook,
  startY: number
): Promise<number> {
  const headerHeight = 320;
  const gradient = ctx.createLinearGradient(0, startY, 0, startY + headerHeight);
  gradient.addColorStop(0, '#FF8A5B');
  gradient.addColorStop(1, '#FF6B6B');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, startY, CANVAS_WIDTH, headerHeight);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.arc(120, startY + 80, 80, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH - 100, startY + 200, 100, 0, Math.PI * 2);
  ctx.fill();

  const avatarSize = 140;
  const avatarX = (CANVAS_WIDTH - avatarSize) / 2;
  const avatarY = startY + 50;

  ctx.save();
  ctx.beginPath();
  ctx.arc(CANVAS_WIDTH / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.stroke();

  if (book.avatar) {
    try {
      const img = await loadImage(book.avatar);
      ctx.save();
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH / 2, avatarY + avatarSize / 2, avatarSize / 2 - 4, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        img,
        avatarX + 4,
        avatarY + 4,
        avatarSize - 8,
        avatarSize - 8
      );
      ctx.restore();
    } catch (e) {
      drawDefaultAvatar(ctx, book.name, avatarX, avatarY, avatarSize);
    }
  } else {
    drawDefaultAvatar(ctx, book.name, avatarX, avatarY, avatarSize);
  }
  ctx.restore();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 44px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(book.name, CANVAS_WIDTH / 2, avatarY + avatarSize + 50);

  ctx.font = '24px -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  const dateText = `${formatDateCN(book.joinDate)} - ${formatDateCN(book.leaveDate)}`;
  ctx.fillText(dateText, CANVAS_WIDTH / 2, avatarY + avatarSize + 90);

  const workDays = daysBetween(book.joinDate, book.leaveDate);
  ctx.font = 'bold 56px -apple-system, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText(`${workDays}天`, CANVAS_WIDTH / 2, avatarY + avatarSize + 160);

  ctx.font = '22px -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillText('感谢一路相伴', CANVAS_WIDTH / 2, avatarY + avatarSize + 200);

  return startY + headerHeight;
}

function drawDefaultAvatar(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  size: number
) {
  const initial = name.charAt(0);
  ctx.fillStyle = '#FFE5D9';
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2 - 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FF8A5B';
  ctx.font = `bold ${size * 0.5}px -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initial, x + size / 2, y + size / 2);
}

function drawMessagesSection(
  ctx: CanvasRenderingContext2D,
  messages: Message[],
  startY: number
): number {
  ctx.fillStyle = '#333';
  ctx.font = 'bold 32px -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('💌 精选祝福', PADDING, startY + 30);

  let y = startY + 60;

  messages.forEach((msg, index) => {
    const cardY = y + index * 150;
    drawMessageCard(ctx, msg, cardY);
  });

  return y + messages.length * 150;
}

function drawMessageCard(
  ctx: CanvasRenderingContext2D,
  message: Message,
  y: number
) {
  const moodInfo = MOOD_OPTIONS.find((m) => m.value === message.mood) || MOOD_OPTIONS[0];
  const cardHeight = 130;

  ctx.save();
  drawRoundedRect(ctx, PADDING, y, CONTENT_WIDTH, cardHeight, 20);
  ctx.fillStyle = '#fff';
  ctx.fill();

  ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;
  ctx.fill();
  ctx.restore();

  const avatarSize = 60;
  ctx.save();
  ctx.beginPath();
  ctx.arc(PADDING + 30 + avatarSize / 2, y + 35 + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.fillStyle = moodInfo.color + '30';
  ctx.fill();
  ctx.fillStyle = moodInfo.color;
  ctx.font = 'bold 28px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const initial = message.isAnonymous ? '匿' : message.authorName.charAt(0);
  ctx.fillText(initial, PADDING + 30 + avatarSize / 2, y + 35 + avatarSize / 2);
  ctx.restore();

  const textX = PADDING + 110;
  const textWidth = CONTENT_WIDTH - 140;

  ctx.fillStyle = '#333';
  ctx.font = 'bold 28px -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const displayName = message.isAnonymous ? '匿名同事' : message.authorName;
  ctx.fillText(displayName, textX, y + 28);

  ctx.fillStyle = moodInfo.color;
  ctx.font = '20px -apple-system, sans-serif';
  const moodLabel = `${moodInfo.emoji} ${moodInfo.label}`;
  ctx.fillText(moodLabel, textX + ctx.measureText(displayName).width + 20, y + 30);

  ctx.fillStyle = '#666';
  ctx.font = '24px -apple-system, sans-serif';
  const contentY = y + 70;
  wrapText(ctx, message.content, textX, contentY, textWidth, 36);

  ctx.fillStyle = '#999';
  ctx.font = '20px -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`❤ ${message.likes}`, PADDING + CONTENT_WIDTH - 20, y + cardHeight - 35);
}

function drawTimelineSection(
  ctx: CanvasRenderingContext2D,
  moments: Moment[],
  startY: number
): number {
  ctx.fillStyle = '#333';
  ctx.font = 'bold 32px -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('📅 共事时光', PADDING, startY + 30);

  let y = startY + 60;

  const lineX = PADDING + 30;
  const itemHeights: number[] = [];
  const nodeYPositions: number[] = [];

  moments.forEach((moment) => {
    const h = calcMomentItemHeight(ctx, moment);
    itemHeights.push(h);
    nodeYPositions.push(y + 20);
    y += h + 20;
  });

  ctx.strokeStyle = '#FFD9B8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(lineX, nodeYPositions[0]);
  ctx.lineTo(lineX, nodeYPositions[nodeYPositions.length - 1]);
  ctx.stroke();

  y = startY + 60;
  moments.forEach((moment, index) => {
    const momentY = y;
    drawMomentItem(ctx, moment, momentY, lineX, itemHeights[index]);
    y += itemHeights[index] + 20;
  });

  return y;
}

function calcMomentItemHeight(
  ctx: CanvasRenderingContext2D,
  moment: Moment
): number {
  const textWidth = CONTENT_WIDTH - 100;
  ctx.font = 'bold 28px -apple-system, sans-serif';
  const titleLines = countTextLines(ctx, `${moment.title}`, textWidth);
  const titleHeight = titleLines * 32;
  ctx.font = '22px -apple-system, sans-serif';
  const descLines = countTextLines(ctx, moment.description, textWidth);
  const descHeight = descLines * 30;
  return Math.max(160, 12 + 22 + 10 + titleHeight + 10 + descHeight + 40);
}

function countTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): number {
  let line = '';
  let lineCount = 1;
  for (let i = 0; i < text.length; i++) {
    const testLine = line + text[i];
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      line = text[i];
      lineCount++;
    } else {
      line = testLine;
    }
  }
  return lineCount;
}

function drawMomentItem(
  ctx: CanvasRenderingContext2D,
  moment: Moment,
  y: number,
  lineX: number,
  itemHeight: number
) {
  const typeInfo = MOMENT_TYPE_OPTIONS.find((t) => t.value === moment.type) || MOMENT_TYPE_OPTIONS[6];

  ctx.save();
  drawRoundedRect(ctx, lineX + 30, y, CONTENT_WIDTH - 60, itemHeight, 16);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(lineX, y + 20, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#FF8A5B';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  const textX = lineX + 50;
  const textWidth = CONTENT_WIDTH - 100;

  ctx.fillStyle = '#FF8A5B';
  ctx.font = '22px -apple-system, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(formatDateCN(moment.date), textX, y + 12);

  const dateBottomY = y + 12 + 22;
  const titleY = dateBottomY + 10;
  ctx.fillStyle = '#333';
  ctx.font = 'bold 28px -apple-system, sans-serif';
  const titleBottomY = wrapText(ctx, `${typeInfo.emoji} ${moment.title}`, textX, titleY, textWidth, 32);

  const descY = titleBottomY + 32 + 10;
  ctx.fillStyle = '#999';
  ctx.font = '22px -apple-system, sans-serif';
  wrapText(ctx, moment.description, textX, descY, textWidth, 30);
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  book: MemorialBook,
  messages: Message[],
  y: number
) {
  const approvedMessages = messages.filter((m) => m.isApproved);
  const senders = new Set(
    approvedMessages.map((m) => (m.isAnonymous ? '匿名同事' : m.authorName))
  );

  ctx.fillStyle = '#FF8A5B';
  ctx.font = 'bold 36px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('感谢一路相伴，祝你前程似锦', CANVAS_WIDTH / 2, y + 40);

  ctx.fillStyle = '#666';
  ctx.font = '24px -apple-system, sans-serif';
  ctx.fillText(
    `共收到 ${approvedMessages.length} 条祝福，${senders.size} 位同事参与`,
    CANVAS_WIDTH / 2,
    y + 85
  );

  const senderList = Array.from(senders).slice(0, 10).join('、');
  ctx.fillStyle = '#999';
  ctx.font = '20px -apple-system, sans-serif';
  wrapText(ctx, senderList + (senders.size > 10 ? '...' : ''), PADDING + 20, y + 120, CONTENT_WIDTH - 40, 30);

  ctx.fillStyle = '#ccc';
  ctx.font = '20px -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('—— 共事时光 · 生成', CANVAS_WIDTH / 2, y + 200);
}

export function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function shareImage(dataUrl: string, title: string): Promise<boolean> {
  if (navigator.share) {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'farewell.jpg', { type: 'image/jpeg' });
      await navigator.share({
        title,
        text: `${title}的离职纪念册`,
        files: [file],
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
