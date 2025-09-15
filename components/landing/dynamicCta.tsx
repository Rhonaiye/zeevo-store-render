import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface DynamicCtaProps {
  title: string
  description: string
  buttonText: string
  buttonLink?: string
  imageSrc: string
  imageAlt: string
  titleWide?: boolean
  highlightLastTwoWords?: boolean
}

const DynamicCta: React.FC<DynamicCtaProps> = ({
  title,
  description,
  buttonText,
  buttonLink,
  imageSrc,
  imageAlt,
  titleWide = false,
  highlightLastTwoWords = false,
}) => {
  // split title if highlight is enabled
  const words = title.split(' ')
  const lastTwo = words.slice(-2).join(' ')
  const rest = words.slice(0, -2).join(' ')

  return (
    <section className="px-6 md:px-10 xl:px-20 bg-white pb-20">
      <motion.div
        className="bg-[#DCFEDE] p-6 md:p-10 min-h-[380px] xl:min-h-[350px] flex flex-col-reverse xl:flex-row justify-between rounded-xl gap-10 relative overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
      >
        {/* Left: Text Content */}
        <motion.div
          className="w-full xl:w-[60%] z-10 flex flex-col gap-3 text-center xl:text-left items-center xl:items-start"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p
            className={`text-black text-2xl sm:text-3xl md:text-[2.2em] font-semibold leading-tight ${
              titleWide ? 'xl:max-w-full' : 'xl:max-w-[80%]'
            }`}
          >
            {highlightLastTwoWords ? (
              <>
                {rest}{' '}
                <span className="text-[#03E525] font-bold">{lastTwo}</span>
              </>
            ) : (
              title
            )}
          </p>
          <p className="text-black text-sm sm:text-base md:text-lg max-w-full sm:max-w-[90%] xl:max-w-[75%]">
            {description}
          </p>

          <div>
            {buttonLink ? (
              <Link href={buttonLink}>
                <button className="bg-[#037834] py-2 px-6 sm:px-7 mt-5 rounded-lg font-semibold text-white hover:bg-[#037834]/90 transition">
                  {buttonText}
                </button>
              </Link>
            ) : (
              <button className="bg-[#037834] py-2 px-6 sm:px-7 mt-5 rounded-lg font-semibold text-white hover:bg-[#037834]/90 transition">
                {buttonText}
              </button>
            )}
          </div>
        </motion.div>

        {/* Right: Image */}
        <motion.div
          className="flex justify-center xl:absolute xl:right-5 xl:-top-10 -mt-5 mb-5 xl:mb-0"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.4, type: 'spring', stiffness: 100 }}
        >
          <Image
            src={imageSrc}
            width={350}
            height={350}
            alt={imageAlt}
            className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] md:w-[300px] md:h-[300px] xl:w-[350px] xl:h-[350px] object-cover"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default DynamicCta
