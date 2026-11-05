import TiptapParser, { type TiptapProps } from 'tiptap-parser';

const ReadOnlyTextCodeEditor = ({
  language = 'javascript',
  content,
  ...rest
}: TiptapProps) => {
  return (
    <TiptapParser
      // the CMS translated field may be empty for a given locale — html-react-parser requires a string
      content={content || ''}
      language={language}
      containerClassName={`
        prose 
        prose-lg
        max-w-none
        font-primary
        leading-relaxed
        text-base md:text-lg
        
        prose-headings:font-bold 
        prose-headings:mt-10 
        prose-headings:mb-5 
        prose-headings:leading-tight
        prose-headings:text-3xl 
        prose-h1:text-3xl prose-h1:md:text-5xl prose-h1:lg:text-6xl
        prose-h2:text-2xl prose-h2:md:text-4xl prose-h2:lg:text-5xl
        prose-h3:text-lg  prose-h3:md:text-3xl prose-h3:lg:text-4xl
        prose-h4:text-base prose-h4:md:text-2xl prose-h4:lg:text-3xl
        prose-h5:text-sm  prose-h5:md:text-xl  prose-h5:lg:text-2xl
        prose-h6:text-xs  prose-h6:md:text-lg  prose-h6:lg:text-xl

        max-[767px]:prose-headings:mt-8 max-[767px]:prose-headings:mb-3
        max-[640px]:prose-headings:mt-5 max-[640px]:prose-headings:mb-2

        prose-p:mb-5 prose-p:text-default dark:prose-p:text-white
        prose-p:md:mb-4


        prose-li:list-disc prose-li:list-decimal
        prose-ul:list-outside prose-ol:list-outside
        prose-li:marker:text-black dark:prose-li:marker:text-white
        prose-li:my-1.5 prose-li:md:my-0.5
        prose-ul:ml-4 prose-ol:ml-4

        prose-a:text-blue-500 prose-a:underline
      `}
      {...rest}
    />
  );
};

export default ReadOnlyTextCodeEditor;
