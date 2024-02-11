export default {
  /**
   * basic Information
   */
  title: `hooninedev.com`,
  description: `후니네`,
  language: `ko`,
  siteUrl: `https://hooninedev.com/`,
  ogImage: `/og-image.png`, // Path to your in the 'static' folder

  /**
   * comments setting
   */
  comments: {
    utterances: {
      repo: `jiji-hoon96/jijihoon96-gatsby-blog-template`, //`danmin20/danmin-gatsby-blog`,
    },
  },

  /**
   * introduce yourself
   */
  author: {
    name: `이지훈`,
    nickname: `후니네`,
    stack: ['React', 'Typescript', '만두'],
    bio: {
      email: `jihoon7705@gmail.com`,
      residence: 'Seoul, South Korea',
    },
    social: {
      github: `https://github.com/jiji-hoon96`,
      linkedIn: `https://www.linkedin.com/in/jiji-hoon96`,
      resume: ``,
    },
    dropdown: {
      tistory: '',
      velog: '',
    },
  },

  /**
   * definition of featured posts
   */
  featured: [
    {
      title: 'Featured1',
      category: 'featured1',
    },
    {
      title: 'Featured2',
      category: 'featured2',
    },
    {
      title: 'Ignored Category',
      category: 'category-ignore', // Keywords with 'ignore' are not categorized
    },
  ],

  /**
   * metadata for About Page
   */
  timestamps: [
    {
      category: 'Career',
      date: '2023.03 - NOW',
      en: 'HicareNet',
      kr: '하이케어넷',
      info: 'Web-FrontEnd',
      link: '',
    },
    {
      category: 'Activity',
      date: '2023.06 - 2023.12',
      en: 'SIPE',
      kr: '사이프',
      info: 'IT 커뮤니티-회원',
      link: '',
    },
    {
      category: 'Activity',
      date: '2024.1 - NOW',
      en: 'SIPE',
      kr: '사이프',
      info: 'IT 커뮤니티-운영진',
      link: '',
    },
  ],

  /*thumb
   * metadata for Playground Page
   */
  projects: [
    {
      title: 'Portfolio',
      description: '포트폴리오',
      techStack: ['React', 'Next.js', 'Typescript'],
      thumbnailUrl: '', // Path to your in the 'assets' folder
      links: {
        post: '',
        github: '',
        demo: '',
        googlePlay: '',
        appStore: '',
      },
    },
  ],
};
