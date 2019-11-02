import React from 'react';
import moment from 'moment';
import cloneDeep from 'clone-deep';

export function plural(n, one, few, many) {
   if (many === undefined)
      return Math.abs(n) === 1 ? one : few;

   n = Math.abs(n) % 100;
   if (n < 10 || n > 20) {
      const x = n % 10;
      if (x == 1)
         return one;
      if (0 < x && x < 5)
         return few;
   }
   return many;
}

export function gender(g, feminine, masculine, neuter = masculine) {
   if (g === 'female') {
      return feminine;
   } else if (g === 'male') {
      return masculine;
   } else {
      return neuter;
   }
}

export function numberFormatter(group, decimal) {
   if (!group && !decimal)
      return n => n.toString();

   function formatInt(n, places) {
      if (places < 0)
         n -= n % Math.pow(10, -places);

      if (n === 0)
         return '0';

      const parts = [ ];
      while (n > 0) {
         parts.unshift((n % 1000).toFixed());
         n = Math.trunc(n / 1000);
      }

      return parts.map((p, i) => i === 0 ? p : p.padStart(3, '0')).join(group);
   }

   return function formatNumber(n, { places = 0, forcePlus = false } = {}) {
      const p = Math.abs(n) + 5 * Math.pow(10, -places - 1);
      const i = Math.trunc(p);

      const sign = Math.sign(n) === -1 ? 
         '\u2212' : 
         (forcePlus ? '+' : '');

      const start = sign + formatInt(i, places);
      if (places <= 0)
         return start;

      const f = p - i;
      return start + decimal + f.toString().slice(2, places + 2);
   }
}

export function dateFormatter(lang) {
   return {
      formatDate(date, format) {
         return moment(date).locale(lang).format(format);
      },
      formatDateIn(date) {
         return moment(date).locale(lang).fromNow();
      }
   }
}

function translator(lang) {
   const dict = buildTranslation(lang);
   return function translate(key, ...args) {
      const tr = key.split('.').reduce((d, k) => {
         const v = d[k];
         if (v === undefined) throw new Error(`Key '${key}' is not found at ${k}`);
         return v;
      }, dict);

      if (typeof tr === 'string') {
         return tr;
      } else {
         return tr.apply(null, args);
      }
   }
}

// const { translations: Langs } = require('./translations/*.js', { mode: 'hash' });
const Langs = {
   az: require('./translations/az').default,
   be: require('./translations/be').default,
   bg: require('./translations/bg').default,
   bn: require('./translations/bn').default,
   de: require('./translations/de').default,
   en: require('./translations/en').default,
   hu: require('./translations/hu').default,
   id: require('./translations/id').default,
   ja: require('./translations/ja').default,
   ka: require('./translations/ka').default,
   lo: require('./translations/lo').default,
   ml: require('./translations/ml').default,
   ne: require('./translations/ne').default,
   pt: require('./translations/pt').default,
   ru: require('./translations/ru').default,
   sah: require('./translations/sah').default,
   sq: require('./translations/sq').default,
   uk: require('./translations/uk').default,
   vi: require('./translations/vi').default,
   zh: require('./translations/zh').default,
};

const Translations = {};

function buildTranslation(lang) {
   if (Translations[lang])
      return Translations[lang];

   const dict = cloneDeep(Langs[lang]);

   if (dict._fallback) {
      merge(dict, buildTranslation(dict._fallback));
   }

   return Translations[lang] = dict;
}

function merge(dst, src) {
   for (const key in src) {
      if (!(key in dst)) {
         dst[key] = cloneDeep(src[key]);
      } else if (src[key] && typeof src[key] === 'object') {
         merge(dst[key], src[key]);
      }
   }
}

export class TranslationContext extends React.Component {
   static get childContextTypes() {
      return {
         'TranslationContext': React.PropTypes.object,
      }
   }

   static get propTypes() { 
      return {
         defaultLang: React.PropTypes.string.isRequired,
         onSetLang: React.PropTypes.func,
      }
   }

   constructor(props) {
      super(props);
      this.state = {
         curLang: null,
      };
   }

   getChildContext() {
      let curLang = this.state.curLang || this.props.defaultLang;
      if (!Langs[curLang])
         curLang = 'en';
      return {
         'TranslationContext': {
            curLang,
            translate: translator(curLang),
            translateFrom: (lang, ...args) => translator(lang)(...args),
            setLang: lang => {
               if (!(lang in Langs)) {
                  throw new Error('Unknown language ' + lang);
               }
               this.setState({ curLang: lang });
               if (this.props.onSetLang)
                  this.props.onSetLang(lang);
            },
            allLangs() {
               return Object.keys(Langs).sort();
            },
         }
      };
   }

   render() {
      return this.props.children;
   }
}

export function withTranslation(Component, prefix) {
   return class Translation extends React.Component {
      static get contextTypes() {
         return {
            'TranslationContext': React.PropTypes.object,
         }
      }

      constructor(props, context) {
         super(props);
         this.updateContext(context);
      }

      componentWillReceiveProps(nextProps, nextContext) {
         if (nextContext.TranslationContext !== this.context.TranslationContext) {
            this.updateContext(nextContext);
         }
      }

      updateContext(context) {
         const translation = { ...context.TranslationContext };
         if (prefix)
            translation.tr = (key, ...args) => translation.translate(prefix + '.' + key,  ...args);
         this._translation = translation;
      }

      render() {
         return <Component {...this.props} translation={this._translation} />
      }
   }
}
