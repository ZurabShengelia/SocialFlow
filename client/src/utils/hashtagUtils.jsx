import React from 'react';

const HASHTAG_REGEX = /(#[\w]+)/g;

export const parseHashtags = (text = '') => {
  const matches = text.match(HASHTAG_REGEX) || [];
  return [...new Set(matches)];
};

export const extractHashtagsFromPosts = (posts = []) => {
  const hashtagCount = {};
  posts.forEach(post => {
    parseHashtags(post.text || '').forEach(tag => {
      hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
    });
  });
  return Object.entries(hashtagCount)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
};

export const HashtagText = ({ text = '', onClick, darkMode }) => {
  if (!text) return null;

  const parts = text.split(HASHTAG_REGEX);

  return (
    <span>
      {parts.map((part, i) => {
        if (HASHTAG_REGEX.test(part)) {

          HASHTAG_REGEX.lastIndex = 0;
          return (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick(part); 
              }}
              className={`font-semibold transition-colors hover:underline ${
                darkMode
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              {part}
            </button>
          );
        }

        HASHTAG_REGEX.lastIndex = 0;
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

export default HashtagText;

