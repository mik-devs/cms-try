<?php

namespace App\Actions;

use DOMDocument;
use DOMElement;
use DOMNode;
use DOMText;

class SanitizeHtmlAction
{
    /**
     * @var list<string>
     */
    private const ALLOWED_TAGS = [
        'p',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'del',
        'ul',
        'ol',
        'li',
        'h2',
        'h3',
        'h4',
        'blockquote',
        'a',
        'img',
        'figure',
        'figcaption',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'hr',
    ];

    /**
     * @var list<string>
     */
    private const REMOVED_TAGS = [
        'script',
        'style',
        'iframe',
        'object',
        'embed',
        'form',
        'input',
        'button',
        'textarea',
        'select',
        'option',
        'meta',
        'link',
        'base',
    ];

    /**
     * @var array<string, list<string>>
     */
    private const ALLOWED_ATTRIBUTES = [
        'a' => ['href'],
        'img' => ['src', 'alt'],
    ];

    public function handle(string $html): string
    {
        if (trim($html) === '') {
            return '';
        }

        $document = new DOMDocument;

        $previousUseInternalErrors = libxml_use_internal_errors(true);

        $loaded = $document->loadHTML(
            '<?xml encoding="UTF-8"><div id="page-content-root">'.$html.'</div>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD,
        );

        libxml_clear_errors();
        libxml_use_internal_errors($previousUseInternalErrors);

        if (! $loaded) {
            return '';
        }

        $root = $document->getElementById('page-content-root')
            ?? $document->getElementsByTagName('div')->item(0);

        if (! $root instanceof DOMElement) {
            return '';
        }

        $this->sanitizeChildren($root);

        $output = '';

        foreach ($root->childNodes as $child) {
            $output .= $document->saveHTML($child);
        }

        return trim($output);
    }

    private function sanitizeChildren(DOMNode $parent): void
    {
        foreach (iterator_to_array($parent->childNodes) as $child) {
            if (! $child instanceof DOMElement) {
                if (! $child instanceof DOMText) {
                    $parent->removeChild($child);
                }

                continue;
            }

            $tag = strtolower($child->tagName);

            if (in_array($tag, self::REMOVED_TAGS, true)) {
                $parent->removeChild($child);

                continue;
            }

            if (! in_array($tag, self::ALLOWED_TAGS, true)) {
                $this->sanitizeChildren($child);

                while ($child->firstChild) {
                    $parent->insertBefore($child->firstChild, $child);
                }

                $parent->removeChild($child);

                continue;
            }

            $this->sanitizeAttributes($child, $tag);

            if ($tag === 'img' && ! $child->hasAttribute('src')) {
                $parent->removeChild($child);

                continue;
            }

            $this->sanitizeChildren($child);
        }
    }

    private function sanitizeAttributes(DOMElement $element, string $tag): void
    {
        $allowedAttributes = self::ALLOWED_ATTRIBUTES[$tag] ?? [];

        for ($index = $element->attributes->length - 1; $index >= 0; $index--) {
            $attribute = $element->attributes->item($index);

            if ($attribute === null) {
                continue;
            }

            if (! in_array(strtolower($attribute->name), $allowedAttributes, true)) {
                $element->removeAttributeNode($attribute);
            }
        }

        if ($tag === 'a' && $element->hasAttribute('href')) {
            $href = trim($element->getAttribute('href'));

            if (! $this->isSafeUrl($href)) {
                $element->removeAttribute('href');
            }
        }

        if ($tag === 'img' && $element->hasAttribute('src')) {
            $src = trim($element->getAttribute('src'));

            if (! $this->isSafeUrl($src, allowMailto: false)) {
                $element->removeAttribute('src');
            }
        }
    }

    private function isSafeUrl(string $url, bool $allowMailto = true): bool
    {
        $url = preg_replace('/[\x00-\x1F\x7F]/u', '', trim($url)) ?? '';

        if ($url === '') {
            return false;
        }

        if (str_starts_with($url, '/') || str_starts_with($url, '#')) {
            return true;
        }

        if (preg_match('/^https?:\/\//i', $url) === 1) {
            return true;
        }

        return $allowMailto && preg_match('/^mailto:/i', $url) === 1;
    }
}
