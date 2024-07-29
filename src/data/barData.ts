export const barData = (dsmScores: any) => [
  {
    label: 'PHQ-9',
    value: dsmScores['PHQ-9 Score'],
    color: '#5271FF',
    faded: dsmScores['PHQ-9 Score'] === 'Not Applicable',
  },
  {
    label: 'GAD-7',
    value: dsmScores['GAD-7 Score'],
    color: '#5271FF',
    faded: dsmScores['GAD-7 Score'] === 'Not Applicable',
  },
  {
    label: 'CBT',
    value: dsmScores['CBT Behavioral Activation'],
    color: '#5271FF',
    faded: dsmScores['CBT Behavioral Activation'] === 'Not Applicable',
  },
  {
    label: 'PSQI',
    value: dsmScores['PSQI Score'],
    color: '#5271FF',
    faded: dsmScores['PSQI Score'] === 'Not Applicable',
  },
  {
    label: 'SFQ',
    value: dsmScores['SFQ Score'],
    color: '#5271FF',
    faded: dsmScores['SFQ Score'] === 'Not Applicable',
  },
  {
    label: 'PSS',
    value: dsmScores['PSS Score'],
    color: '#5271FF',
    faded: dsmScores['PSS Score'] === 'Not Applicable',
  },
  {
    label: 'SSRS',
    value: dsmScores['SSRS Assessment'],
    color: '#5271FF',
    faded: dsmScores['SSRS Assessment'] === 'Not Applicable',
  },
];

export const lineLabels = ['S.1', 'S.2', 'S.3', 'S.4', 'S.5', 'S.6', 'S.7'];
