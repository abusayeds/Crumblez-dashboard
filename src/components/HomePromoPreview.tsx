import { fileUrl } from '../lib/api'
import type { HomePromo } from '../lib/types'

// Mirrors the storefront's What's New banner: photo with a frosted copy card in
// the lower-left, blue headline with a red highlight, and the red CTA on the
// bottom-right. Kept close to the live tile so edits can be judged here.

type Props = {
  promo: HomePromo
}

export function HomePromoPreview({ promo }: Props) {
  return (
    <div className="rounded-[12px] bg-[#eef1f5] p-[8px]">
      <div className="relative overflow-hidden rounded-[10px]">
        {promo.imageUrl ? (
          <img
            alt=""
            className="block aspect-[10/3] w-full object-cover"
            src={fileUrl(promo.imageUrl)}
          />
        ) : (
          <div className="flex aspect-[10/3] w-full items-center justify-center bg-[#dbe2ea] text-[0.85rem] text-muted">
            No image yet
          </div>
        )}
        <div className="absolute bottom-[10px] left-[10px] max-w-[24rem] rounded-[16px] bg-white/90 p-[14px] backdrop-blur">
          <p className="m-0 text-[1.1rem] font-extrabold leading-tight text-blue">
            {promo.headlinePre}
            <span className="text-red">{promo.headlineAccent}</span>
            {promo.headlinePost}
          </p>
          {promo.bodyText ? (
            <p className="mb-0 mt-[6px] text-[0.8rem] text-ink">
              {promo.bodyText}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-[8px] flex justify-end">
        <span className="rounded-full bg-red px-[16px] py-[7px] text-[0.75rem] font-bold text-white">
          {promo.ctaLabel || 'Order Now'}
        </span>
      </div>
    </div>
  )
}
