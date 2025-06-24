import os

# Rename map: kebab-case → camel-case (preserve "-dark")
filename_map = {
    "backgroundColor.svg": "backgroundColor.svg",
    "backgroundColor-dark.svg": "backgroundColor-dark.svg",
    "backgroundEmpty.svg": "backgroundEmpty.svg",
    "backgroundEmpty-dark.svg": "backgroundEmpty-dark.svg",
    "containerCenter.svg": "containerCenter.svg",
    "containerCenter-dark.svg": "containerCenter-dark.svg",
    "hero.svg": "hero.svg",
    "hero-dark.svg": "hero-dark.svg",
    
    "blurbs-3.svg": "blurbs3.svg",
    "blurbs-3-dark.svg": "blurbs3-dark.svg",
    "blurbs-4.svg": "blurbs4.svg",
    "blurbs-4-dark.svg": "blurbs4-dark.svg",
    "blurbs-vertical-3.svg": "blurbsVertical3.svg",
    "blurbs-vertical-3-dark.svg": "blurbsVertical3-dark.svg",
    
    "button-primary-center.svg": "buttonPrimaryCenter.svg",
    "button-primary-center-dark.svg": "buttonPrimaryCenter-dark.svg",
    "button-primary-left.svg": "buttonPrimaryLeft.svg",
    "button-primary-left-dark.svg": "buttonPrimaryLeft-dark.svg",
    "button-secondary-center.svg": "buttonSecondaryCenter.svg",
    "button-secondary-center-dark.svg": "buttonSecondaryCenter-dark.svg",
    "button-secondary-left.svg": "buttonSecondaryLeft.svg",
    "button-secondary-left-dark.svg": "buttonSecondaryLeft-dark.svg",
    
    "buttons-2-center.svg": "buttons2Center.svg",
    "buttons-2-center-dark.svg": "buttons2Center-dark.svg",
    "buttons-2-left.svg": "buttons2Left.svg",
    "buttons-2-left-dark.svg": "buttons2Left-dark.svg",

    "cards-2.svg": "cards2.svg",
    "cards-2-dark.svg": "cards2-dark.svg",
    "cards-2-center.svg": "cards2Center.svg",
    "cards-2-center-dark.svg": "cards2Center-dark.svg",
    "cards-2x2.svg": "cards2x2.svg",
    "cards-2x2-dark.svg": "cards2x2-dark.svg",
    "cards-3.svg": "cards3.svg",
    "cards-3-dark.svg": "cards3-dark.svg",
    "cards-4.svg": "cards4.svg",
    "cards-4-dark.svg": "cards4-dark.svg",
    "cards-6.svg": "cards6.svg",
    "cards-6-dark.svg": "cards6-dark.svg",

    "chev-up.svg": "chevUp.svg",
    "dark-layer.svg": "darkLayer.svg",
    "light-layer.svg": "lightLayer.svg",
    "styleguide.svg": "styleguide.svg",
    "styleguide-dark.svg": "styleguide-dark.svg",

    "list-1.svg": "list1.svg",
    "list-1-dark.svg": "list1-dark.svg",
    "list-2.svg": "list2.svg",
    "list-2-dark.svg": "list2-dark.svg",
    "list-3.svg": "list3.svg",
    "list-3-dark.svg": "list3-dark.svg",

    "pricing-2.svg": "pricing2.svg",
    "pricing-2-dark.svg": "pricing2-dark.svg",

    "zz-left.svg": "zigzagLeft.svg",
    "zz-left-dark.svg": "zigzagLeft-dark.svg",
    "zz-right.svg": "zigzagRight.svg",
    "zz-right-dark.svg": "zigzagRight-dark.svg",
}

for old_name, new_name in filename_map.items():
    if os.path.exists(old_name):
        os.rename(old_name, new_name)
        print(f"✅ {old_name} → {new_name}")
    else:
        print(f"⚠️  {old_name} not found")