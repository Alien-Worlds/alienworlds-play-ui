import humanizeDuration from 'humanize-duration'

const humanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    },
  },
  units: ['w', 'd', 'h', 'm', 's'],
  round: true,
  delimiter: ' ',
  spacer: '',
})

export const humanizeMissionTime = (duration: number) => humanizer(duration)

export const humanizeMissionDuration = (duration: number) =>
  humanizeDuration(duration, {
    language: 'en',
    units: ['w', 'd', 'h'],
    round: true,
  })
