/* eslint-disable @cspell/spellchecker */
import Parse from 'parse';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Head from '@/components/Head';
import { createOrUpdateArticle } from '@/redux/actions/article.action';
import { createBatchTest, deleteBatchTest, sendCodeToEmailTest } from '@/redux/actions/test.action';

import MiscButton from './MiscButton';


const article = {
  categories: [{
    __type: 'Pointer',
    className: 'Category',
    objectId: 'BhSBy8MQev',
  }],
  translated: {
    en: {
      slug: '',
      tags: '',
      metaTitle: '',
      metaDescription: '',
      description: '',
      title: '',
      content: '',
    },
    fr: {
      slug: 'les-democrates-vont-vouloir-debrancher-le-candidat-biden',
      tags: 'test',
      metaTitle: 'Les Démocrates vont vouloir débrancher le candidat Biden',
      metaDescription: 'Les Démocrates vont vouloir débrancher le candidat Biden',
      description: 'Les Démocrates vont vouloir débrancher le candidat Biden. Mais pour mettre ' +
        'qui à la place ? Comment gagner en 4 mois et demi ?',
      title: 'Les Démocrates vont vouloir débrancher le candidat Biden',
      content: '<h3 class="custom-heading">Regardez cet extrait</h3>' +
        '<p> Trump au sujet de Biden qui vient de bredouiller une réponse « Je ne sais ' +
        'pas ce qu’il a dit et je suis pas sûr qu’il sache lui-même ce qu’il vient de dire » ' +
        '!…(cf vidéo ⤵️)</p> <p>Les Démocrates vont vouloir débrancher le candidat Biden. Mais ' +
        'pour mettre qui à la place ? Comment gagner en 4 mois et demi ?</p>',
    },
    mg: {
      slug: '',
      tags: '',
      metaTitle: '',
      metaDescription: '',
      description: '',
      title: '',
      content: '',
    },
  },
};

const Tests = () => {
  const dispatch = useDispatch();
  const {
    t,
  } = useTranslation();

  /**
   * button with action used for each misc action
   * @param color
   * @param label
   * @param action
   * @param withSeparator
   * @returns
   */
  const miscButton = (color: string, label: string, action: () => void, withSeparator = false): ReactNode => {
    return (
      <MiscButton
        action={action}
        color={color}
        label={label}
        withSeparator={withSeparator}
      />
    );
  };

  const handleCreateBatchTest = () => dispatch(createBatchTest(1000));
  const handleDeleteBatchTest = () => dispatch(deleteBatchTest());
  const handleCreateArticle = () => dispatch(createOrUpdateArticle(null, article));
  const handleSendArticleToNewsletter = async () => {
    await Parse.Cloud.run('sendArticleToNewsletterTest', {
    // if the email is not specified, it will be sent to all newsletter emails
      email: 'tiavinamika@gmail.com',
      articleId: 'QgMSqteBoM',
    });
  };
  const handleSendEmailVerification = () => dispatch(sendCodeToEmailTest('sendVerificationCodeTest'));
  const handleSendEmailResetPasswordCode = () =>
    dispatch(sendCodeToEmailTest('sendResetPasswordVerificationCodeTest'));

  return (
    <>
      <Head title={t('misc.miscellaneous')} />
      <div className="flexColumn center flex1 stretchSelf" css={{ gap: 12 }}>
        {miscButton('white', t('misc.createBatchTest'), handleCreateBatchTest)}
        {miscButton('red', t('misc.deleteBatchTest'), handleDeleteBatchTest)}
        {miscButton('red', t('misc.createArticle'), handleCreateArticle, true)}
        {miscButton('green', t('misc.sendArticleToNewsletter'), handleSendArticleToNewsletter)}
        {miscButton('green', t('misc.sendEmailVerification'), handleSendEmailVerification)}
        {miscButton('green', t('misc.sendResetPassword'), handleSendEmailResetPasswordCode)}
      </div>
    </>
  );
};

export default Tests;
