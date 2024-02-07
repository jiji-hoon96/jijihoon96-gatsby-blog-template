export default {
  /**
   * basic Information
   */
  title: `hooninedev.com`,
  description: `후니네`,
  language: `ko`,
  siteUrl: `https://jeong-min.com/`,
  ogImage: `/og-image.png`, // Path to your in the 'static' folder

  /**
   * comments setting
   */
  comments: {
    utterances: {
      repo: ``, //`danmin20/danmin-gatsby-blog`,
    },
  },

  /**
   * introduce yourself
   */
  author: {
    name: `이지훈`,
    nickname: `후니네`,
    stack: ['Frontend', 'React', 'Typescript'],
    bio: {
      email: `jihoon7705@gmail.com`,
      residence: 'Seoul, South Korea',
      bachelorDegree: '',
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
      date: '2022.01.04 - NOW',
      en: 'A Corp.',
      kr: 'A 회사',
      info: 'A 팀',
      link: '',
    },
    {
      category: 'Career',
      date: '2021.01.04 - 2022.01.04',
      en: 'B Corp.',
      kr: 'B 회사',
      info: 'B 팀',
      link: '',
    },
    {
      category: 'Activity',
      date: '2023.07 - NOW',
      en: 'Community',
      kr: '커뮤니티',
      info: 'IT 커뮤니티',
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
