'use client';

import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  open: boolean;
};
const HamburgerMenuSvgMobile = ({ open }: Props) => {
  return (
    <svg
      aria-hidden="true"
      data-name="Layer 1"
      height="20.01"
      id="hamburger"
      viewBox="0 0 20.03 20.01"
      width="20.03"
      xmlns="http://www.w3.org/2000/svg"
    >


      <AnimatePresence>
        {!open && (
          <motion.g
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            id="lt-g"
            initial={{ opacity: 0 }}
            key="lt-g"
            transition={{ duration: 0.7 }}
          >
            <path
              d="M5.83,8H2.05A2.08,2.08,0,0,1,0,5.87V2.09A2.1,2.1,0,0,1,2.05,0H5.83A2.12,2.12,0,0,1,8,2.08H8V5.87a2.14,2.14,0,0,1-.63,1.48A2.05,2.05,0,0,1,5.85,8h0Z"
              data-name="out"
              id="out-3"
              transform="translate(0.03 0)"
              className={`
                fill-default
                dark:fill-white
              `}
            />
            <path
              d="M2.05,1a1.12,1.12,0,0,0-.8.33,1.17,1.17,0,0,0-.34.79v3.8A1.14,1.14,0,0,0,2,7h3.8A1.13,1.13,0,0,0,7,5.89H7V2.09A1.13,1.13,0,0,0,5.85,1H2.05Z"
              data-name="in"
              id="in-3"
              transform="translate(0.03 0)"
              className={`
                fill-white
                dark:fill-neutral-900
              `}
            />
          </motion.g>
        )}
      </AnimatePresence>
      <g id="rb-g">
        <path
          d="M5.86,20H2.08A2.08,2.08,0,0,1,0,17.92V14.14a2.1,2.1,0,0,1,2.08-2.09H5.86A2.12,2.12,0,0,1,8,14.13H8v3.78a2.14,2.14,0,0,1-.63,1.48,2.05,2.05,0,0,1-1.49.6h0Z"
          id="out"
          transform="translate(0.03 0)"
          className={`
            fill-default
            dark:fill-white
          `}
        />
        <path
          d="M2.08,13A1.14,1.14,0,0,0,.94,14.12v3.8a1.14,1.14,0,0,0,1.12,1.14h3.8A1.13,1.13,0,0,0,7,17.94H7v-3.8A1.13,1.13,0,0,0,5.88,13H2.08Z"
          id="in"
          transform="translate(0.03 0)"
          className={`
            fill-white
            dark:fill-neutral-900
          `}
        />
      </g>
      <g id="lb-g">
        <path
          d="M17.86,20H14.08A2.08,2.08,0,0,1,12,17.92V14.14a2.11,2.11,0,0,1,.61-1.47,2.17,2.17,0,0,1,1.47-.62h3.78a2.18,2.18,0,0,1,1.5.6A2.1,2.1,0,0,1,20,14.13h0v3.78A2.12,2.12,0,0,1,17.88,20h0Z"
          data-name="out"
          id="out-2"
          transform="translate(0.03 0)"
          className={`
            fill-default
            dark:fill-white
          `}
        />
        <path
          d="M14.08,13a1.16,1.16,0,0,0-.8.33,1.13,1.13,0,0,0-.34.79v3.8a1.14,1.14,0,0,0,1.12,1.14h3.8A1.13,1.13,0,0,0,19,18h0v-3.8a1.15,1.15,0,0,0-.32-.8,1.22,1.22,0,0,0-.8-.34h-3.8Z"
          data-name="in"
          id="in-2"
          transform="translate(0.03 0)"
          className={`
            fill-white
            dark:fill-neutral-900
          `}
        />
      </g>
      <g id="rt-g">
        <path
          d="M17.86,8H14.08a2.12,2.12,0,0,1-1.47-.62A2.07,2.07,0,0,1,12,5.88V2.1A2.08,2.08,0,0,1,14.08,0h3.78a2.13,2.13,0,0,1,1.5.59A2.1,2.1,0,0,1,20,2.08h0V5.88A2.12,2.12,0,0,1,17.88,8h0Z"
          data-name="out"
          id="out-4"
          transform="translate(0.03 0)"
          className={`
            fill-default
            dark:fill-white
          `}
        />
        <path
          d="M14.08,1a1.15,1.15,0,0,0-.8.32,1.13,1.13,0,0,0-.34.8v3.8a1.08,1.08,0,0,0,.33.79,1.14,1.14,0,0,0,.79.35h3.8a1.14,1.14,0,0,0,.8-.33A1.09,1.09,0,0,0,19,5.9h0V2.1a1.16,1.16,0,0,0-.32-.81,1.16,1.16,0,0,0-.8-.33h-3.8Z"
          data-name="in"
          id="in-4"
          transform="translate(0.03 0)"
          className={`
            fill-white
            dark:fill-neutral-900
          `}
        />
      </g>
    </svg>
  );
};

export default HamburgerMenuSvgMobile;
