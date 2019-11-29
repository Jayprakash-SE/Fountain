import React from 'react';
import { withTranslation } from './../translate';
import { getNavitagorLang } from './../utils';
import SendReportButton from './SendReportButton';
import WikiLink from './WikiLink';

const Footer = ({ translation: { tr }}) =>
   <div className='Footer mainContentPane'>
      <span>{tr('preLink')}</span>
      <WikiLink to='User_talk:Ле Лой'>{tr('link')}</WikiLink>
      <span>{tr('postLink')}</span>
      {' '}
      <a className='WikiLink' rel='noopener noreferrer' target='_blank'
         href={`https://meta.wikimedia.org/w/index.php?title=Special:Translate&group=page-Wikipedia+Asian+Month%2FTool+Interface&language=${getNavitagorLang() || 'en'}&filter=%21translated&action=translate`}>
         Translate this page.
      </a>
      <SendReportButton />
   </div>

export default withTranslation(Footer, 'Footer');
