function renderHighlights(text, corrections) {
  let highlighted = "";
  let lastIndex = 0;

  corrections.forEach((c) => {
    highlighted += text.slice(lastIndex, c.start);
    highlighted += `<span class="bg-yellow-400 px-1 rounded cursor-help" title="${c.description}">
                      ${text.slice(c.start, c.end)}
                    </span>`;
    lastIndex = c.end;
  });

  highlighted += text.slice(lastIndex);
  return highlighted;
}
