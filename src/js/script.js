"use strict";

const writingList = document.querySelector("[data-writing-list]");
const postPage = document.querySelector("[data-post-page]");

const FALLBACK_POSTS = [
  {
    slug: "hello-from-the-new-notebook",
    title: "Hello from the new notebook",
    summary: "Why this site now has a writing space for engineering notes, research progress, and public updates.",
    date: "2026-07-03",
    category: "Site note",
    readingTime: "2 min read",
    file: "posts/hello-from-the-new-notebook.md"
  },
  {
    slug: "what-i-mean-by-practice",
    title: "What I mean by practice",
    summary: "A short note connecting software engineering, computer vision research, and Kendo.",
    date: "2026-07-03",
    category: "Personal system",
    readingTime: "2 min read",
    file: "posts/what-i-mean-by-practice.md"
  }
];

const FALLBACK_MARKDOWN = {
  "posts/hello-from-the-new-notebook.md": [
    "# Hello from the new notebook",
    "",
    "This site is becoming more than a resume page. I want it to be a small public record of what I am learning, building, and thinking about.",
    "",
    "The main threads are simple:",
    "",
    "- software engineering work that teaches me how production systems behave",
    "- computer vision research that keeps me close to questions about perception",
    "- Kendo practice that reminds me progress is usually quiet before it becomes visible",
    "",
    "I plan to use this space for short technical notes, project updates, research reflections, and writing that can also be shared on LinkedIn or other platforms.",
    "",
    "## How posts work",
    "",
    "Each note is a Markdown file in the `posts/` folder. To publish a new one, I can add a new `.md` file and list it in `posts/index.json`.",
    "",
    "That keeps the site lightweight enough for GitHub Pages while still making writing feel natural."
  ].join("\n"),
  "posts/what-i-mean-by-practice.md": [
    "# What I mean by practice",
    "",
    "Practice is the word that connects the parts of my life that might look separate at first.",
    "",
    "In software engineering, practice means building clean systems, reading failures carefully, and developing taste for what should be simple.",
    "",
    "In computer vision research, practice means returning to the data, checking assumptions, and noticing when a model is learning the wrong shortcut.",
    "",
    "In Kendo, practice means repetition without sleepwalking. The same cut can be empty or alive depending on attention.",
    "",
    "That is the tone I want this site to hold: playful enough to stay curious, serious enough to keep improving."
  ].join("\n")
};

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const inlineMarkdown = (value) => {
  let text = escapeHtml(value);
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+|[^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  return text;
};

const markdownToHtml = (markdown) => {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let list = [];
  let inCode = false;
  let codeLines = [];
  let codeLanguage = "";

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("```")) {
      if (inCode) {
        const languageClass = codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : "";
        html.push(`<pre><code${languageClass}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        codeLanguage = "";
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        codeLanguage = trimmedLine.slice(3).trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9_-]/g, "");
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeLines.push(line);
      return;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      html.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`);
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      html.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`);
      return;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      html.push(`<h1>${inlineMarkdown(trimmed.slice(2))}</h1>`);
      return;
    }

    if (trimmed.startsWith("> ")) {
      flushParagraph();
      flushList();
      html.push(`<blockquote>${inlineMarkdown(trimmed.slice(2))}</blockquote>`);
      return;
    }

    if (/^- /.test(trimmed)) {
      flushParagraph();
      list.push(trimmed.slice(2));
      return;
    }

    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();

  if (inCode) {
    const languageClass = codeLanguage ? ` class="language-${escapeHtml(codeLanguage)}"` : "";
    html.push(`<pre><code${languageClass}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }

  return html.join("\n");
};

const enhancePostContent = (container) => {
  if (window.renderMathInElement) {
    window.renderMathInElement(container, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false }
      ],
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
      throwOnError: false
    });
  }

  if (window.hljs) {
    container.querySelectorAll("pre code").forEach((block) => {
      window.hljs.highlightElement(block);
    });
  }
};

const formatDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
};

const loadPosts = async () => {
  try {
    const response = await fetch("posts/index.json");
    if (!response.ok) {
      throw new Error("Could not load posts/index.json");
    }
    return response.json();
  } catch {
    return FALLBACK_POSTS;
  }
};

const loadMarkdown = async (file) => {
  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`Could not load ${file}`);
    }
    return response.text();
  } catch (error) {
    if (FALLBACK_MARKDOWN[file]) {
      return FALLBACK_MARKDOWN[file];
    }
    throw error;
  }
};

const getSlug = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug") || window.location.hash.replace("#", "");
};

const renderWritingList = async () => {
  if (!writingList) return;

  try {
    const posts = await loadPosts();
    writingList.innerHTML = posts
      .map(
        (post) => `
          <a class="writing-entry" href="post.html?slug=${encodeURIComponent(post.slug)}">
            <time datetime="${post.date}">${formatDate(post.date)}</time>
            <h2>${escapeHtml(post.title)}</h2>
            <span>${escapeHtml(post.category)}</span>
          </a>
        `
      )
      .join("");
  } catch {
    writingList.innerHTML = "<p class=\"loading-note\">Blog posts could not be loaded.</p>";
  }
};

const renderPostPage = async () => {
  if (!postPage) return;

  try {
    const posts = await loadPosts();
    const slug = getSlug();
    const post = posts.find((item) => item.slug === slug) || posts[0];

    if (!post) {
      postPage.innerHTML = "<p>No posts are available yet.</p>";
      return;
    }

    const markdown = await loadMarkdown(post.file);
    document.title = `${post.title} - Wuchen Li`;
    postPage.innerHTML = `
      <div class="post-meta-row">
        <span>${formatDate(post.date)}</span>
        <a class="share-link" href="post.html?slug=${encodeURIComponent(post.slug)}" data-copy-link>Copy link</a>
      </div>
      ${markdownToHtml(markdown)}
    `;
    enhancePostContent(postPage);
  } catch {
    postPage.innerHTML = "<p>This note could not be loaded. Please check the post slug and Markdown file path.</p>";
  }
};

document.addEventListener("click", async (event) => {
  const copyLink = event.target.closest("[data-copy-link]");
  if (!copyLink) return;
  event.preventDefault();

  const url = new URL(copyLink.getAttribute("href"), window.location.href).href;
  try {
    await navigator.clipboard.writeText(url);
    copyLink.textContent = "Copied";
  } catch {
    window.location.href = url;
  }
});

renderWritingList();
renderPostPage();
