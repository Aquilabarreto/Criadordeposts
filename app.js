const canvas = document.querySelector("#postCanvas");
const ctx = canvas.getContext("2d");

const state = {
  activeSlide: 0,
  global: {
    size: 1080,
    theme: "dark",
    style: "flat",
    fontSize: 46,
    displayName: "Lucas Felix",
    username: "lucasffelix",
    source: "Twitter for iPhone",
    verified: true,
    autoDate: false,
    date: "14 de abril, 2026",
    time: "09:23",
    avatar: null,
    engagement: {
      show: true,
      views: "2.5M",
      replies: "2,954",
      retweets: "10.5K",
      likes: "56.5K",
      bookmarks: "18K"
    }
  },
  slides: [
    {
      blocks: []
    }
  ]
};

const els = {
  slideList: document.querySelector("#slideList"),
  blocksList: document.querySelector("#blocksList"),
  currentSlideLabel: document.querySelector("#currentSlideLabel"),
  addSlideBtn: document.querySelector("#addSlideBtn"),
  addTextBlockBtn: document.querySelector("#addTextBlockBtn"),
  addImageBlockBtn: document.querySelector("#addImageBlockBtn"),
  exportCurrentBtn: document.querySelector("#exportCurrentBtn"),
  exportAllBtn: document.querySelector("#exportAllBtn"),
  randomizeBtn: document.querySelector("#randomizeBtn"),
  canvasSize: document.querySelector("#canvasSize"),
  avatarInput: document.querySelector("#avatarInput"),
  fontSize: document.querySelector("#fontSize"),
  fontSizeValue: document.querySelector("#fontSizeValue"),
  displayName: document.querySelector("#displayName"),
  username: document.querySelector("#username"),
  sourceText: document.querySelector("#sourceText"),
  showVerified: document.querySelector("#showVerified"),
  themeLight: document.querySelector("#themeLight"),
  themeDark: document.querySelector("#themeDark"),
  postStyle: document.querySelector("#postStyle"),
  autoDate: document.querySelector("#autoDate"),
  postDate: document.querySelector("#postDate"),
  postTime: document.querySelector("#postTime"),
  showEngagement: document.querySelector("#showEngagement"),
  views: document.querySelector("#views"),
  replies: document.querySelector("#replies"),
  retweets: document.querySelector("#retweets"),
  likes: document.querySelector("#likes"),
  bookmarks: document.querySelector("#bookmarks")
};

function activeSlide() {
  return state.slides[state.activeSlide];
}

function setCanvasSize() {
  const height = Number(state.global.size);
  canvas.width = 1080;
  canvas.height = height;
  if (height === 1350) {
    canvas.style.aspectRatio = "1080 / 1350";
    canvas.style.height = "min(72vh, 700px)";
  } else {
    canvas.style.aspectRatio = "1 / 1";
    canvas.style.height = "min(60vh, 620px)";
  }
}

function draw() {
  setCanvasSize();
  const w = canvas.width;
  const h = canvas.height;
  drawBackground(w, h);
  drawTweet(w, h);
}

function drawBackground(w, h) {
  if (state.global.theme === "light") {
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, "#12c8ef");
    gradient.addColorStop(1, "#0989fb");
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = "#000";
  }
  ctx.fillRect(0, 0, w, h);
}

function palette() {
  const isDark = state.global.theme === "dark";
  return {
    isDark,
    card: isDark ? "#000000" : "#ffffff",
    text: isDark ? "#f7f9f9" : "#0f1419",
    muted: isDark ? "#71767b" : "#536471",
    line: isDark ? "#2f3336" : "#cfd9de",
    blue: "#1d9bf0",
    icon: isDark ? "#71767b" : "#66757f",
    shadow: isDark ? "rgba(0,0,0,0)" : "rgba(15,20,25,0.15)"
  };
}

function drawTweet(w, h) {
  const p = palette();

  if (state.global.theme === "dark" && state.global.style === "flat") {
    drawCompactTweet(w, h, p);
    return;
  }

  const card = getCardRect(w, h);

  if (state.global.style === "card") {
    roundedRect(card.x, card.y, card.w, card.h, p.isDark ? 0 : 42);
    ctx.fillStyle = p.card;
    ctx.fill();
  }

  drawHeader(card, p);
  drawBlocks(card, p);
  drawMeta(card, p);
  if (state.global.engagement.show) {
    drawEngagement(card, p);
  }
}

function drawCompactTweet(w, h, p) {
  const s = Math.min(w, h) / 1080;
  const left = 89 * s;
  const right = 961 * s;
  const avatarSize = 132 * s;
  const avatarX = left;
  const avatarY = 238 * s;
  const textX = 254 * s;

  drawAvatar(avatarX, avatarY, avatarSize, p);

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = p.text;
  ctx.font = `700 ${55 * s}px Arial, sans-serif`;
  const displayName = state.global.displayName || "Lucas Felix";
  ctx.fillText(displayName, textX, 295 * s);

  if (state.global.verified) {
    const nameWidth = ctx.measureText(displayName).width;
    drawVerified(textX + nameWidth + 10 * s, 248 * s, 44 * s);
  }

  ctx.fillStyle = p.muted;
  ctx.font = `${40 * s}px Arial, sans-serif`;
  ctx.fillText(`@${state.global.username || "lucasffelix"}`, textX, 345 * s);

  ctx.fillStyle = p.muted;
  ctx.font = `700 ${48 * s}px Arial, sans-serif`;
  ctx.fillText("...", 909 * s, 302 * s);

  const date = state.global.autoDate ? currentDateLabel() : state.global.date;
  const time = (state.global.autoDate ? currentTimeLabel() : state.global.time).replace(":", "h");
  const meta = `${time} Â· ${date}`;
  ctx.font = `${29 * s}px Arial, sans-serif`;
  ctx.fillStyle = p.muted;
  ctx.fillText(meta, left, 481 * s);
  const metaWidth = ctx.measureText(meta).width;
  ctx.fillStyle = p.blue;
  ctx.fillText(` Â· ${state.global.source || "Twitter for iPhone"}`, left + metaWidth, 481 * s);

  ctx.strokeStyle = p.line;
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(left, 526 * s);
  ctx.lineTo(right, 526 * s);
  ctx.stroke();

  drawCompactEngagement(left, right, 584 * s, s, p);

  ctx.beginPath();
  ctx.moveTo(left, 623 * s);
  ctx.lineTo(right, 623 * s);
  ctx.stroke();
}

function drawCompactEngagement(left, right, baseline, s, p) {
  ctx.fillStyle = p.muted;
  ctx.font = `${26 * s}px Arial, sans-serif`;
  ctx.textBaseline = "alphabetic";

  drawViewsIcon(112 * s, baseline - 10 * s, s, p.icon);
  ctx.fillText(state.global.engagement.views, 151 * s, baseline);

  drawReplyIconScaled(276 * s, baseline - 9 * s, s, p.icon);
  ctx.fillText(state.global.engagement.replies, 306 * s, baseline);

  drawRetweetIconScaled(423 * s, baseline - 9 * s, s, p.icon);
  ctx.fillText(state.global.engagement.retweets, 459 * s, baseline);

  drawHeartIconScaled(595 * s, baseline - 9 * s, s, p.icon);
  ctx.fillText(state.global.engagement.likes, 628 * s, baseline);

  drawShareIconScaled(766 * s, baseline - 9 * s, s, p.icon);
}

function getCardRect(w, h) {
  if (state.global.style === "flat") {
    const width = Math.round(w * 0.72);
    const height = Math.round(h * 0.42);
    return {
      x: Math.round((w - width) / 2),
      y: Math.round((h - height) / 2),
      w: width,
      h: height,
      pad: 30
    };
  }

  const width = Math.round(w * 0.74);
  const minHeight = Math.round(h * 0.62);
  return {
    x: Math.round((w - width) / 2),
    y: Math.round(h * 0.14),
    w: width,
    h: Math.min(Math.round(h * 0.72), Math.max(minHeight, 700)),
    pad: 40
  };
}

function drawHeader(card, p) {
  const avatarSize = state.global.style === "flat" ? 72 : 100;
  const avatarX = card.x + card.pad;
  const avatarY = card.y + card.pad - 2;
  drawAvatar(avatarX, avatarY, avatarSize, p);

  const textX = avatarX + avatarSize + 16;
  const nameY = avatarY + 28;
  ctx.fillStyle = p.text;
  ctx.font = `700 ${state.global.style === "flat" ? 34 : 34}px Arial, sans-serif`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(state.global.displayName || "Your Name", textX, nameY);

  const nameWidth = ctx.measureText(state.global.displayName || "Your Name").width;
  if (state.global.verified) {
    drawVerified(textX + nameWidth + 12, nameY - 23, 24);
  }

  ctx.fillStyle = p.muted;
  ctx.font = `${state.global.style === "flat" ? 28 : 31}px Arial, sans-serif`;
  ctx.fillText(`@${state.global.username || "username"}`, textX, nameY + 32);

  ctx.fillStyle = p.muted;
  ctx.font = "700 32px Arial, sans-serif";
  ctx.fillText("...", card.x + card.w - card.pad - 36, avatarY + 18);
}

function drawAvatar(x, y, size, p) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();

  const avatar = state.global.avatar;
  if (avatar) {
    ctx.drawImage(avatar, x, y, size, size);
  } else {
    const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
    gradient.addColorStop(0, "#21d4fd");
    gradient.addColorStop(1, "#2152ff");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, size, size);
  }

  ctx.restore();
  ctx.strokeStyle = p.isDark ? "#05070a" : "#ffffff";
  ctx.lineWidth = Math.max(2, size * 0.015);
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.stroke();
}

function drawVerified(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#1d9bf0";
  ctx.beginPath();
  for (let i = 0; i < 16; i += 1) {
    const angle = (Math.PI * 2 * i) / 16;
    const radius = i % 2 === 0 ? size / 2 : size / 2.45;
    ctx.lineTo(size / 2 + Math.cos(angle) * radius, size / 2 + Math.sin(angle) * radius);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(size * 0.29, size * 0.52);
  ctx.lineTo(size * 0.44, size * 0.66);
  ctx.lineTo(size * 0.72, size * 0.35);
  ctx.stroke();
  ctx.restore();
}

function drawBlocks(card, p) {
  let y = card.y + card.pad + (state.global.style === "flat" ? 122 : 164);
  const maxWidth = card.w - card.pad * 2;

  for (const block of activeSlide().blocks) {
    if (block.type === "text") {
      y = drawTextBlock(block, card.x + card.pad, y, maxWidth, p) + 24;
    } else {
      y = drawImageBlock(block, card.x + card.pad, y, maxWidth) + 28;
    }
  }
}

function drawTextBlock(block, x, y, maxWidth, p) {
  const size = Number(block.size || state.global.fontSize);
  const lineHeight = Math.round(size * 1.25);
  ctx.font = `${size}px Arial, sans-serif`;
  ctx.fillStyle = p.text;
  ctx.textBaseline = "top";

  const paragraphs = String(block.text || "").split("\n");
  let cursorY = y;
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      cursorY += lineHeight;
      continue;
    }

    const words = paragraph.split(/\s+/);
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        fillSmartLine(line, x, cursorY, maxWidth, block.align, p);
        line = word;
        cursorY += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) {
      fillSmartLine(line, x, cursorY, maxWidth, block.align, p);
      cursorY += lineHeight;
    }
  }

  return cursorY;
}

function fillSmartLine(line, x, y, maxWidth, align, p) {
  const drawX = align === "center" ? x + (maxWidth - ctx.measureText(line).width) / 2 : x;
  if (line.startsWith("#")) {
    ctx.fillStyle = p.blue;
    ctx.fillText(line, drawX, y);
    ctx.fillStyle = p.text;
    return;
  }

  const parts = line.split(/(\s+)/);
  let cursor = drawX;
  for (const part of parts) {
    ctx.fillStyle = part.startsWith("#") ? p.blue : p.text;
    ctx.fillText(part, cursor, y);
    cursor += ctx.measureText(part).width;
  }
}

function drawImageBlock(block, x, y, maxWidth) {
  if (!block.image) {
    ctx.fillStyle = "rgba(148, 163, 184, 0.12)";
    roundedRect(x, y, maxWidth, Number(block.height || 360), block.rounded ? 24 : 0);
    ctx.fill();
    ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]);
    return y + Number(block.height || 360);
  }

  const image = block.image;
  const targetH = Number(block.height || 360);
  const targetW = maxWidth;
  ctx.save();
  roundedRect(x, y, targetW, targetH, block.rounded ? 24 : 0);
  ctx.clip();

  const scale = Math.max(targetW / image.width, targetH / image.height);
  const sw = targetW / scale;
  const sh = targetH / scale;
  const sx = (image.width - sw) / 2;
  const sy = (image.height - sh) / 2;
  ctx.drawImage(image, sx, sy, sw, sh, x, y, targetW, targetH);
  ctx.restore();

  return y + targetH;
}

function drawMeta(card, p) {
  const metaY = card.y + card.h - (state.global.engagement.show ? 218 : 118);
  ctx.fillStyle = p.muted;
  ctx.font = "28px Arial, sans-serif";
  ctx.textBaseline = "alphabetic";

  const date = state.global.autoDate ? currentDateLabel() : state.global.date;
  const time = state.global.autoDate ? currentTimeLabel() : state.global.time;
  let text = `${time} Â· ${date}`;
  ctx.fillText(text, card.x + card.pad, metaY);

  const textWidth = ctx.measureText(text).width;
  ctx.fillStyle = p.blue;
  ctx.fillText(` Â· ${state.global.source || "Twitter for iPhone"}`, card.x + card.pad + textWidth, metaY);
}

function drawEngagement(card, p) {
  const top = card.y + card.h - 190;
  const left = card.x + card.pad;
  const width = card.w - card.pad * 2;

  ctx.strokeStyle = p.line;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left + width, top);
  ctx.stroke();

  const lineY = top + 58;
  ctx.fillStyle = p.text;
  ctx.font = "700 28px Arial, sans-serif";
  ctx.textBaseline = "alphabetic";

  const statText = [
    [state.global.engagement.retweets, "Retweets"],
    [state.global.engagement.replies, "Quotes"],
    [state.global.engagement.likes, "Likes"],
    [state.global.engagement.bookmarks, "Bookmarks"]
  ];

  let x = left;
  for (const [value, label] of statText) {
    ctx.fillStyle = p.text;
    ctx.fillText(value, x, lineY);
    const valueWidth = ctx.measureText(value).width;
    ctx.fillStyle = p.muted;
    ctx.font = "26px Arial, sans-serif";
    ctx.fillText(` ${label}`, x + valueWidth, lineY);
    x += valueWidth + ctx.measureText(` ${label}`).width + 30;
    ctx.font = "700 28px Arial, sans-serif";
  }

  ctx.strokeStyle = p.line;
  ctx.beginPath();
  ctx.moveTo(left, top + 92);
  ctx.lineTo(left + width, top + 92);
  ctx.stroke();

  const iconsY = top + 144;
  const iconGap = width / 5;
  drawReplyIcon(left + iconGap * 0.45, iconsY, p.icon);
  drawRetweetIcon(left + iconGap * 1.48, iconsY, p.icon);
  drawHeartIcon(left + iconGap * 2.5, iconsY, "#f91880");
  drawBookmarkIcon(left + iconGap * 3.5, iconsY, p.icon);
  drawShareIcon(left + iconGap * 4.5, iconsY, p.icon);
}

function drawReplyIcon(x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(x, y, 18, 14, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 7, y + 12);
  ctx.lineTo(x - 16, y + 23);
  ctx.stroke();
  ctx.restore();
}

function drawRetweetIcon(x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x - 22, y - 8);
  ctx.lineTo(x + 14, y - 8);
  ctx.lineTo(x + 14, y - 18);
  ctx.stroke();
  triangle(x + 14, y - 24, x + 28, y - 10, x + 14, y + 4);
  ctx.beginPath();
  ctx.moveTo(x + 22, y + 10);
  ctx.lineTo(x - 14, y + 10);
  ctx.lineTo(x - 14, y + 20);
  ctx.stroke();
  triangle(x - 14, y + 26, x - 28, y + 12, x - 14, y - 2);
  ctx.restore();
}

function drawHeartIcon(x, y, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + 18);
  ctx.bezierCurveTo(x - 36, y - 6, x - 20, y - 32, x, y - 12);
  ctx.bezierCurveTo(x + 20, y - 32, x + 36, y - 6, x, y + 18);
  ctx.fill();
  ctx.restore();
}

function drawBookmarkIcon(x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x - 15, y - 22);
  ctx.lineTo(x + 15, y - 22);
  ctx.lineTo(x + 15, y + 24);
  ctx.lineTo(x, y + 12);
  ctx.lineTo(x - 15, y + 24);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawShareIcon(x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x, y + 14);
  ctx.lineTo(x, y - 22);
  ctx.moveTo(x - 12, y - 10);
  ctx.lineTo(x, y - 22);
  ctx.lineTo(x + 12, y - 10);
  ctx.moveTo(x - 20, y + 4);
  ctx.lineTo(x - 20, y + 24);
  ctx.lineTo(x + 20, y + 24);
  ctx.lineTo(x + 20, y + 4);
  ctx.stroke();
  ctx.restore();
}

function drawViewsIcon(x, y, scale, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5 * scale;
  ctx.lineCap = "round";
  const bars = [
    [0, 12],
    [10, 20],
    [20, 6],
    [30, 16]
  ];
  for (const [offset, height] of bars) {
    ctx.beginPath();
    ctx.moveTo(x + offset * scale, y + 20 * scale);
    ctx.lineTo(x + offset * scale, y + (20 - height) * scale);
    ctx.stroke();
  }
  ctx.restore();
}

function drawReplyIconScaled(x, y, scale, color) {
  ctx.save();
  ctx.scale(scale, scale);
  drawReplyIcon(x / scale, y / scale, color);
  ctx.restore();
}

function drawRetweetIconScaled(x, y, scale, color) {
  ctx.save();
  ctx.scale(scale * 0.68, scale * 0.68);
  drawRetweetIcon(x / (scale * 0.68), y / (scale * 0.68), color);
  ctx.restore();
}

function drawHeartIconScaled(x, y, scale, color) {
  ctx.save();
  ctx.scale(scale * 0.58, scale * 0.58);
  drawHeartIcon(x / (scale * 0.58), y / (scale * 0.58), color);
  ctx.restore();
}

function drawShareIconScaled(x, y, scale, color) {
  ctx.save();
  ctx.scale(scale * 0.68, scale * 0.68);
  drawShareIcon(x / (scale * 0.68), y / (scale * 0.68), color);
  ctx.restore();
}

function triangle(x1, y1, x2, y2, x3, y3) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
}

function roundedRect(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function renderSlideList() {
  els.slideList.innerHTML = "";
  state.slides.forEach((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `slide-item${index === state.activeSlide ? " active" : ""}`;
    button.innerHTML = `<span class="slide-drag">::</span><span>Slide ${index + 1}</span>`;
    button.addEventListener("click", () => {
      state.activeSlide = index;
      syncUi();
      draw();
    });
    els.slideList.appendChild(button);
  });
}

function renderBlocks() {
  els.blocksList.innerHTML = "";

  if (!activeSlide().blocks.length) {
    const empty = document.createElement("div");
    empty.className = "empty-blocks";
    empty.textContent = "No content blocks. Add text or image to get started.";
    els.blocksList.appendChild(empty);
    return;
  }

  activeSlide().blocks.forEach((block) => {
    const template = document.querySelector(block.type === "text" ? "#textBlockTemplate" : "#imageBlockTemplate");
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = block.id;

    node.querySelector(".remove-block").addEventListener("click", () => {
      activeSlide().blocks = activeSlide().blocks.filter((item) => item.id !== block.id);
      renderBlocks();
      draw();
    });

    if (block.type === "text") {
      const textarea = node.querySelector("textarea");
      const size = node.querySelector(".block-size");
      const align = node.querySelector(".block-align");
      textarea.value = block.text;
      size.value = block.size;
      align.value = block.align;
      textarea.addEventListener("input", () => {
        block.text = textarea.value;
        draw();
      });
      size.addEventListener("input", () => {
        block.size = Number(size.value);
        draw();
      });
      align.addEventListener("input", () => {
        block.align = align.value;
        draw();
      });
    } else {
      const height = node.querySelector(".block-height");
      const rounded = node.querySelector(".block-rounded");
      const file = node.querySelector(".block-image");
      height.value = block.height;
      rounded.checked = block.rounded;
      height.addEventListener("input", () => {
        block.height = Number(height.value);
        draw();
      });
      rounded.addEventListener("change", () => {
        block.rounded = rounded.checked;
        draw();
      });
      file.addEventListener("change", async () => {
        const image = await loadImageFromFile(file.files[0]);
        block.image = image;
        draw();
      });
    }

    els.blocksList.appendChild(node);
  });
}

function syncUi() {
  els.currentSlideLabel.textContent = `Slide ${state.activeSlide + 1}`;
  els.canvasSize.value = String(state.global.size);
  els.fontSize.value = state.global.fontSize;
  els.fontSizeValue.textContent = `${state.global.fontSize}px`;
  els.displayName.value = state.global.displayName;
  els.username.value = state.global.username;
  els.sourceText.value = state.global.source;
  els.showVerified.checked = state.global.verified;
  els.postStyle.value = state.global.style;
  els.autoDate.checked = state.global.autoDate;
  els.postDate.value = state.global.date;
  els.postTime.value = state.global.time;
  els.showEngagement.checked = state.global.engagement.show;
  els.views.value = state.global.engagement.views;
  els.replies.value = state.global.engagement.replies;
  els.retweets.value = state.global.engagement.retweets;
  els.likes.value = state.global.engagement.likes;
  els.bookmarks.value = state.global.engagement.bookmarks;
  els.themeLight.classList.toggle("active", state.global.theme === "light");
  els.themeDark.classList.toggle("active", state.global.theme === "dark");
  renderSlideList();
  renderBlocks();
}

function bind() {
  els.addSlideBtn.addEventListener("click", () => {
    state.slides.push({
      blocks: [
        {
          id: crypto.randomUUID(),
          type: "text",
          text: "Nova ideia para o carrossel.\n#conteudo",
          size: state.global.fontSize,
          align: "left"
        }
      ]
    });
    state.activeSlide = state.slides.length - 1;
    syncUi();
    draw();
  });

  els.addTextBlockBtn.addEventListener("click", () => {
    activeSlide().blocks.push({
      id: crypto.randomUUID(),
      type: "text",
      text: "Escreva seu texto aqui.",
      size: state.global.fontSize,
      align: "left"
    });
    renderBlocks();
    draw();
  });

  els.addImageBlockBtn.addEventListener("click", () => {
    activeSlide().blocks.push({
      id: crypto.randomUUID(),
      type: "image",
      image: null,
      height: 360,
      rounded: true
    });
    renderBlocks();
    draw();
  });

  els.avatarInput.addEventListener("change", async () => {
    state.global.avatar = await loadImageFromFile(els.avatarInput.files[0]);
    draw();
  });

  bindInput(els.canvasSize, "size", (value) => Number(value));
  bindInput(els.fontSize, "fontSize", (value) => {
    els.fontSizeValue.textContent = `${value}px`;
    return Number(value);
  });
  bindInput(els.displayName, "displayName");
  bindInput(els.username, "username", (value) => value.replace(/^@/, ""));
  bindInput(els.sourceText, "source");
  bindInput(els.postStyle, "style");
  bindInput(els.postDate, "date");
  bindInput(els.postTime, "time");

  els.showVerified.addEventListener("change", () => {
    state.global.verified = els.showVerified.checked;
    draw();
  });

  els.autoDate.addEventListener("change", () => {
    state.global.autoDate = els.autoDate.checked;
    draw();
  });

  els.themeLight.addEventListener("click", () => setTheme("light"));
  els.themeDark.addEventListener("click", () => setTheme("dark"));

  els.showEngagement.addEventListener("change", () => {
    state.global.engagement.show = els.showEngagement.checked;
    draw();
  });

  for (const key of ["views", "replies", "retweets", "likes", "bookmarks"]) {
    els[key].addEventListener("input", () => {
      state.global.engagement[key] = els[key].value;
      draw();
    });
  }

  els.randomizeBtn.addEventListener("click", () => {
    state.global.engagement.views = randomMetric(1.2, 9.8, "M");
    state.global.engagement.replies = randomMetric(850, 9800, "");
    state.global.engagement.retweets = randomMetric(6, 92, "K");
    state.global.engagement.likes = randomMetric(22, 310, "K");
    state.global.engagement.bookmarks = randomMetric(8, 88, "K");
    syncUi();
    draw();
  });

  els.exportCurrentBtn.addEventListener("click", () => {
    exportSlide(state.activeSlide);
  });

  els.exportAllBtn.addEventListener("click", exportAllZip);
}

function bindInput(el, key, transform = (value) => value) {
  el.addEventListener("input", () => {
    state.global[key] = transform(el.value);
    draw();
  });
}

function setTheme(theme) {
  state.global.theme = theme;
  syncUi();
  draw();
}

function currentDateLabel() {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date());
}

function currentTimeLabel() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function randomMetric(min, max, suffix) {
  const value = Math.random() * (max - min) + min;
  if (!suffix) {
    return Math.round(value).toLocaleString("en-US");
  }
  return `${value.toFixed(value < 10 ? 1 : 0)}${suffix}`;
}

function loadImageFromFile(file) {
  if (!file) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function exportSlide(index) {
  const previous = state.activeSlide;
  state.activeSlide = index;
  draw();
  const blob = await canvasToBlob();
  downloadBlob(blob, `carousel-slide-${index + 1}.png`);
  state.activeSlide = previous;
  draw();
}

function canvasToBlob() {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png", 1);
  });
}

async function exportAllZip() {
  const previous = state.activeSlide;
  const files = [];

  for (let i = 0; i < state.slides.length; i += 1) {
    state.activeSlide = i;
    draw();
    const blob = await canvasToBlob();
    files.push({
      name: `carousel-slide-${String(i + 1).padStart(2, "0")}.png`,
      data: new Uint8Array(await blob.arrayBuffer())
    });
  }

  const zipBlob = createZip(files);
  downloadBlob(zipBlob, "carousel-slides.zip");
  state.activeSlide = previous;
  draw();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name);
    const crc = crc32(file.data);
    const local = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, file.data.length, true);
    localView.setUint32(22, file.data.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    local.set(nameBytes, 30);
    localParts.push(local, file.data);

    const central = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, file.data.length, true);
    centralView.setUint32(24, file.data.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    central.set(nameBytes, 46);
    centralParts.push(central);

    offset += local.length + file.data.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const centralOffset = offset;
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, centralOffset, true);

  return new Blob([...localParts, ...centralParts, end], { type: "application/zip" });
}

let crcTable = null;
function crc32(data) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      crcTable[n] = c >>> 0;
    }
  }

  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

bind();
syncUi();
draw();
