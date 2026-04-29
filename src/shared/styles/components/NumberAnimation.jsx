import React from 'react'

import { Colors } from 'shared/util/colors'
import { motion, useAnimation } from 'framer-motion'
import { v4 } from 'uuid'
const NUMBERS = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
]

function findFirstDifferenceIndex(arr1, arr2) {
  // Determine the shorter array length to avoid out-of-bounds access
  const minLength = Math.min(arr1.length, arr2.length)

  // Iterate through the arrays up to the length of the shorter one
  for (let i = 0; i < minLength; i++) {
    // Check if the elements at the current index are different
    if (arr1[i] !== arr2[i]) {
      return i // Return the index of the first difference
    }
  }

  // If no difference is found within the length of the shorter array,
  // and if the arrays are of different lengths, the first difference
  // is at the end of the shorter array
  if (arr1.length !== arr2.length) {
    return minLength
  }

  // If no difference is found and the arrays are of the same length, return -1
  return -1
}
// lib
const AnimatedNumber = ({
  animateToNumber,
  previousNumber,
  fontStyle,
  transitions,
  includeComma,
  locale,
}) => {
  const ref = React.useRef(null)

  const controls = useAnimation()
  const keyCount = React.useRef(0)
  const animateTonumberString = includeComma
    ? Math.abs(animateToNumber).toLocaleString(locale || 'en-US')
    : String(Math.abs(animateToNumber))
  const previousNumberString = includeComma
    ? Math.abs(previousNumber).toLocaleString(locale || 'en-US')
    : String(Math.abs(animateToNumber))
  const previousNumberArr = Array.from(previousNumberString, Number).map((x, idx) =>
    isNaN(x) ? previousNumberString[idx] : x
  )
  const animateToNumbersArr = Array.from(animateTonumberString, Number).map((x, idx) =>
    isNaN(x) ? animateTonumberString[idx] : x
  )
  const firstDifferenceIndex =
    previousNumber > 0 ? findFirstDifferenceIndex(previousNumberArr, animateToNumbersArr) : 0
  const [numberHeight, setNumberHeight] = React.useState(30)
  const [numberWidth, setNumberWidth] = React.useState(0)

  const numberDivRef = React.useRef(null)

  React.useEffect(() => {
    const rect = numberDivRef.current.getClientRects()?.[0]
    if (rect) {
      setNumberHeight(rect.height)
      setNumberWidth(rect.width)
      controls.start('visible')
    }
  }, [animateToNumber, fontStyle])

  return (
    <span ref={ref} style={{ minWidth: 'min-content' }}>
      {}
      {numberHeight !== 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden',
            maxHeight: numberHeight - numberHeight * 0.22,
          }}
        >
          {animateToNumbersArr.length > 1 &&
            animateToNumber !== previousNumber &&
            animateToNumbersArr.map((n, index) => {
              if (
                typeof n === 'string' ||
                (previousNumberArr[index] === animateToNumbersArr[index] &&
                  index < firstDifferenceIndex)
              ) {
                return (
                  <div
                    key={index}
                    style={{
                      ...fontStyle,
                      color: 'white',
                      marginLeft: typeof n === 'string' ? '1px' : '0px',
                      marginRight: n === 1 ? '2px' : '0px',
                      width: typeof n === 'string' || n === 1 ? numberWidth / 2.5 : numberWidth,
                    }}
                  >
                    {n}
                  </div>
                )
              }

              return (
                <div
                  key={v4()}
                  id="number-animation"
                  style={{
                    maxHeight: numberHeight - numberHeight * 0.22,
                    color: Colors.CARIBBEAN_GREEN,
                    width: n === 1 ? numberWidth / 2 : numberWidth,
                  }}
                >
                  {animateToNumbersArr.length > 1 &&
                    NUMBERS.map((number) => {
                      return (
                        <motion.div
                          style={{
                            ...fontStyle,
                          }}
                          key={`${keyCount.current++}`}
                          initial="hidden"
                          variants={{
                            hidden: { y: 0 },
                            visible: {
                              y:
                                -1 * (numberHeight * animateToNumbersArr[index]) -
                                numberHeight * 10,
                            },
                          }}
                          animate={controls}
                          transition={transitions?.(index)}
                        >
                          {number}
                        </motion.div>
                      )
                    })}
                </div>
              )
            })}
          {(animateToNumbersArr.length === 1 ||
            animateToNumber === 0 ||
            animateToNumber === previousNumber) && (
            <div style={{ ...fontStyle, color: 'white' }}>{animateToNumber}</div>
          )}
        </div>
      )}

      <div ref={numberDivRef} style={{ position: 'absolute', top: -9999, ...fontStyle }}>
        {0}
      </div>
    </span>
  )
}

const Enhanced = React.memo(AnimatedNumber, (prevProps, nextProps) => {
  return (
    prevProps.animateToNumber === nextProps.animateToNumber &&
    prevProps.fontStyle === nextProps.fontStyle &&
    prevProps.includeComma === nextProps.includeComma
  )
})

export default Enhanced
