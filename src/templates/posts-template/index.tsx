import { navigate } from 'gatsby';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import PostCard from '@/src/components/PostCard';
import Seo from '@/src/components/Seo';
import Layout from '@/src/layout';
import PostClass from '@/src/models/post';
import { AllMarkdownRemark } from '@/src/type';

import * as S from './styled';

type PostsTemplateProps = {
  location: Location;
  pageContext: {
    currentCategory: string;
    categories: string[];
    edges: AllMarkdownRemark['edges'];
  };
};

const PostsTemplate: React.FC<PostsTemplateProps> = ({ location, pageContext }) => {
  const { edges, currentCategory } = pageContext;
  const { categories } = pageContext;
  const currentTabIndex = useMemo(
    () => categories.findIndex((category) => category === currentCategory),
    [categories, currentCategory],
  );
  const posts = edges.map(({ node }) => new PostClass(node));

  const onTabIndexChange = (value: number) => {
    if (value === 0) return navigate(`/posts`);
    navigate(`/posts/${categories[value]}`);
  };

  const ref = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState(posts);

  useEffect(() => {
    const filtered = posts.filter((post) => post.title.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredPosts(filtered);
  }, [searchTerm]);

  // currentTab이 가운데에 오도록 스크롤
  useEffect(() => {
    if (!ref.current) return;
    const currentTab = ref.current.children[currentTabIndex] as HTMLDivElement;
    ref.current.scrollTo({ left: currentTab.offsetLeft - (ref.current.offsetWidth - currentTab.offsetWidth) / 2 });
  }, []);

  return (
    <Layout location={location}>
      <Seo title='후니네 개발하우스 | Posts' />
      <S.CategoryWrapper>
        <S.CategoryTitle>{categories[currentTabIndex]}</S.CategoryTitle>
        <S.CategorySubtitle>{`${posts.length} post${posts.length < 2 ? '' : 's'}`}</S.CategorySubtitle>
        <S.SearchInput
          type='text'
          placeholder='Please enter your search term'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </S.CategoryWrapper>

      <S.TabWrapper>
        <S.Tabs ref={ref}>
          {categories.map((title, index) => (
            <S.Tab
              key={index}
              isSelected={currentTabIndex === index ? 'true' : 'false'}
              onClick={() => onTabIndexChange(index)}
            >
              {title}
            </S.Tab>
          ))}
        </S.Tabs>

        <S.PostCardsWrapper>
          {filteredPosts.map((post, index) => (
            <PostCard key={index} post={post} />
          ))}
        </S.PostCardsWrapper>
      </S.TabWrapper>
    </Layout>
  );
};

export default PostsTemplate;
