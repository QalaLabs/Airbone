import { HONEYPOT_FIELD } from '@/utils/honeypot'

// Off-screen (not display:none, which some bots skip), removed from the tab
// order and the accessibility tree so keyboard and screen-reader users never reach it.
export default function Honeypot({ inputRef }) {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', left: '-10000px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }}
    >
      <input
        ref={inputRef}
        type="text"
        name={HONEYPOT_FIELD}
        data-testid="honeypot"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  )
}
