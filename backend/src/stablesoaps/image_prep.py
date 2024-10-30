import math
import textwrap

from PIL import Image, ImageDraw, ImageFont


def cm_to_pixels(cm: int, dpi=300) -> int:
    inches = cm / 2.54
    return int(inches * dpi)


def create_padded_sticker(
    sticker: Image,
    sticker_size_px: int,
    padding_px: int,
) -> Image:
    """Returns a padded version of `sticker` that fits within `sticker_size_px`"""
    inner_size_px = sticker_size_px - (padding_px * 2)
    sticker.thumbnail((inner_size_px, inner_size_px))
    sticker_bg = Image.new(
        "RGBA",
        (sticker_size_px, sticker_size_px),
        color=(0, 0, 0, 0),
    )
    sticker_bg.paste(sticker, (padding_px, padding_px))
    return sticker_bg


def create_circular_image(
    image: Image.Image,
    output_size: int,
    background_color: str = "white",
) -> Image.Image:
    """
    Convert a rectangular image into a circular one.

    Args:
        image: Source PIL Image
        output_size: Desired size (diameter) of the output circular image
        background_color: Color to use for the background

    Returns:
        PIL Image with the source image cropped into a circle
    """
    # Resize image to be square with the desired output size
    # Calculate the resize ratio to maintain aspect ratio
    ratio = output_size / min(image.size)
    new_size = tuple(math.ceil(dim * ratio) for dim in image.size)
    resized_image = image.resize(new_size, Image.Resampling.LANCZOS)

    # Create a square crop from the center of the resized image
    left = (resized_image.width - output_size) // 2
    top = (resized_image.height - output_size) // 2
    right = left + output_size
    bottom = top + output_size
    squared_image = resized_image.crop((left, top, right, bottom))

    # Create a new image with an alpha channel for transparency
    output_image = Image.new("RGBA", (output_size, output_size), (0, 0, 0, 0))

    # Create a circular mask
    mask = Image.new("L", (output_size, output_size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, output_size, output_size), fill=255)

    # Create the background circle
    background = Image.new("RGBA", (output_size, output_size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(background)
    bg_draw.ellipse((0, 0, output_size, output_size), fill=background_color)

    # Composite the images together
    output_image = Image.composite(squared_image, background, mask)

    return output_image


def create_details_label(
    label_text: str,
    size_px: int,
    font: ImageFont,
    font_size: int,
    background_color: str,
    wrap_factor=1.5,
) -> Image:
    label = Image.new(
        "RGB",
        (size_px, size_px),
        color=background_color,
    )
    label_draw = ImageDraw.Draw(label)
    lines = label_text.split("\n")
    y_text = 20
    for line in lines:
        wrapped_line = textwrap.fill(
            line,
            width=size_px // (font_size // wrap_factor),
        )
        for wrap in wrapped_line.split("\n"):
            label_draw.text(
                (20, y_text),
                wrap,
                font=font,
                fill="black",
            )
            left, top, right, bottom = font.getbbox(wrap)
            y_text += bottom - top

        left, top, right, bottom = font.getbbox(wrap)
        y_text += bottom - top
    return label


def get_text_dimensions(text: str, font: ImageFont) -> tuple:
    """Get the width and height of a text string with given font."""
    bbox = font.getbbox(text)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def create_details_label_circle(
    label_text: str,
    size_px: int,
    font: ImageFont,
    font_size: int,
    background_color: str,
    wrap_factor=1.5,
) -> Image:
    """Create a circular label with centered text that fits within the circle."""
    # Create new image with alpha channel for circle masking
    label = Image.new("RGBA", (size_px, size_px), (0, 0, 0, 0))
    label_draw = ImageDraw.Draw(label)

    # Calculate circle parameters
    center = size_px // 2
    radius = (size_px // 2) - 10  # Leaving 10px margin

    # Draw circle
    circle_bbox = [
        (center - radius, center - radius),
        (center + radius, center + radius),
    ]
    label_draw.ellipse(circle_bbox, fill=background_color)

    # Calculate maximum width for text (using Pythagorean theorem)
    max_text_width = int(
        math.sqrt(2) * radius
    )  # This ensures text fits in circle

    # Split and wrap text
    lines = label_text.split("\n")
    wrapped_lines = []
    for line in lines:
        # Adjust wrap width based on circle constraints
        wrap_width = int(max_text_width // (font_size // wrap_factor))
        wrapped = textwrap.fill(line, width=wrap_width)
        wrapped_lines.extend(wrapped.split("\n"))

    # Calculate total text height
    total_height = 0
    _, line_height = get_text_dimensions(wrapped_lines[0], font)
    total_height = line_height * len(wrapped_lines)

    # Calculate starting y position to center text vertically
    y_text = center - (total_height // 2)

    # Draw each line
    for i, line in enumerate(wrapped_lines):
        # Get line dimensions
        width, _ = get_text_dimensions(line, font)

        # Calculate x position to center text horizontally
        x_text = center - (width // 2)

        # Draw text
        label_draw.text(
            (x_text, y_text),
            line,
            font=font,
            fill="black",
        )

        y_text += line_height
    return label


def create_tiled_sticker_sheet(
    sheet_width_px, sheet_height_px, image_size_px, images, dpi=300
):
    # Calculate how many stickers can fit in each row and column
    stickers_per_row = sheet_width // image_size_px
    stickers_per_column = sheet_height // image_size_px
    stickers_per_sheet = stickers_per_row * stickers_per_column

    sheets = []
    sheet = Image.new(
        "RGBA",
        (sheet_width_px, sheet_height_px),
        color=(0, 0, 0, 0),
    )
    for idx, sticker in enumerate(images):
        if idx > 0 and idx % stickers_per_sheet == 0:
            sheets.append(sheet)
            sheet = Image.new(
                "RGBA",
                (sheet_width_px, sheet_height_px),
                color=(0, 0, 0, 0),
            )
        sticker.thumbnail((image_size_px, image_size_px))
        row = (idx % stickers_per_sheet) // stickers_per_row
        col = (idx % stickers_per_sheet) % stickers_per_row
        x = col * sticker_width
        y = row * sticker_height
        sheet.paste(sticker, (x, y))
    if len(images) % stickers_per_sheet != 0:
        sheets.append(sheet)
    return sheets


def create_avery_22807_label(images, dpi=300):
    sheet_width_px = cm_to_pixels(21.59)
    sheet_height_px = cm_to_pixels(27.94)
    image_size_px = cm_to_pixels(5.08)
    stickers_per_row = 3
    stickers_per_sheet = 12
    col_pos = [
        cm_to_pixels(1.58),
        cm_to_pixels(8.25),
        cm_to_pixels(14.92),
    ]
    row_pos = [
        cm_to_pixels(1.59),
        cm_to_pixels(8.15),
        cm_to_pixels(14.71),
        cm_to_pixels(21),
    ]
    sheets = []
    sheet = Image.new(
        "RGBA",
        (sheet_width_px, sheet_height_px),
        color=(0, 0, 0, 0),
    )
    for idx, sticker in enumerate(images):
        if idx > 0 and idx % stickers_per_sheet == 0:
            sheets.append(sheet)
            sheet = Image.new(
                "RGBA",
                (sheet_width_px, sheet_height_px),
                color=(0, 0, 0, 0),
            )
        sticker.thumbnail((image_size_px, image_size_px))
        row = (idx % stickers_per_sheet) // stickers_per_row
        col = (idx % stickers_per_sheet) % stickers_per_row
        x = col_pos[col]
        y = row_pos[row]
        sheet.paste(sticker, (x, y))
    if len(images) % stickers_per_sheet != 0:
        sheets.append(sheet)
    return sheets
