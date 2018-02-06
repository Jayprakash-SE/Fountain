﻿using System;

namespace WikiFountain.Server.Core
{
    using System.Text.RegularExpressions;
    using Wiki = Tuple<Predicate<string>, Func<string, string>>;

    public static class MediaWikis
    {
        private static readonly Wiki[] Wikis = 
        {
            Const("meta", "meta.wikimedia.org"),
            Const("commons", "commons.wikimedia.org"),
            Regex(@"^([a-z0-9\-]+)$", "$1.wikipedia.org"),
            Regex(@"^q:([a-z0-9\-]+)$", "$1.wikiquote.org"),
            Regex(@"^s:([a-z0-9\-]+)$", "$1.wikisource.org"),
            Regex(@"^b:([a-z0-9\-]+)$", "$1.wikibooks.org"),
            Regex(@"^n:([a-z0-9\-]+)$", "$1.wikinews.org"),
            Regex(@"^v:([a-z0-9\-]+)$", "$1.wikiversity.org"),
            Regex(@"^voy:([a-z0-9\-]+)$", "$1.wikivoyage.org"),
            Regex(@"^wikt:([a-z0-9\-]+)$", "$1.wiktionary.org"),
        };

        private static Wiki Const(string code, string url)
        {
            return new Wiki(x => x == code, x => url);
        }
        private static Wiki Regex(string regex, string replace)
        {
            var r = new Regex(regex);
            return new Wiki(r.IsMatch, x => r.Replace(x, replace));
        }

        public static MediaWiki Create(string code, Identity identity)
        {
            foreach (var wiki in Wikis)
            {
                if (wiki.Item1(code))
                    return new MediaWiki(code, "https://" + wiki.Item2(code) + "/w/api.php", identity);
            }
            throw new Exception(string.Format("Unknown wiki '{0}'.", code));
        }

        public static MediaWiki CreateMeta(Identity identity)
        {
            return Create("meta", identity);
        }
    }
}
