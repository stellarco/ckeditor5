/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';

// Auxiliary imports
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';

export default class StellarEditor extends ClassicEditorBase {
	constructor( sourceElementOrData, config ) {
		super( sourceElementOrData, config );

		if (config.enableAutomaticLinkPasting) {
			this.on('ready', () => {
				this.setupAutomaticLinkPasting();
			});
		}

		if (config.iframely) {
			this.enableIframely( config.iframely.apiKey );
		}
	}

	setupAutomaticLinkPasting() {
		const writer = new UpcastWriter( this.editing.view.document );

		this.plugins.get( 'ClipboardPipeline' ).on( 'inputTransformation', ( evt, data ) => {
			const selection = this.model.document.selection;
			const range = selection.getFirstRange();
			let linkText;

			for (const item of range.getItems()) {
				linkText = item.data;
				break;
			}

			let isTextUrl = false;

			try {
				new URL( data.content.getChild( 0 ).data );
				isTextUrl = true;
			} catch (_) {
			}

			if (linkText && data.content.childCount === 1 && isTextUrl) {
				const linkUrl = data.content.getChild( 0 ).data;

				data.content = writer.createDocumentFragment( [
					writer.createElement(
						'a',
						{ href: linkUrl },
						[ writer.createText( linkText ) ]
					)
				] );
			}
		} );
	}

	enableIframely(iframelyApiKey) {
		const IFRAME_SRC = '//cdn.iframe.ly/api/iframe';

		this.config.set( 'mediaEmbed.previewsInData', false );
		this.config.set( 'mediaEmbed.providers', [
			{
				// hint: this is just for previews. Get actual HTML codes by making API calls from your CMS
				name: 'iframely previews',

				// Match all URLs or just the ones you need:
				url: /.+/,

				html: match => {
					const url = match[0];

					var iframeUrl = IFRAME_SRC + '?app=1&api_key=' + iframelyApiKey + '&url=' + encodeURIComponent( url );
					// alternatively, use &key= instead of &api_key with the MD5 hash of your api_key
					// more about it: https://iframely.com/docs/allow-origins

					return (
						// If you need, set maxwidth and other styles for 'iframely-embed' class - it's yours to customize
						'<div class="iframely-embed">' +
						'<div class="iframely-responsive">' +
						`<iframe src="${ iframeUrl }" ` +
						'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
						'</iframe>' +
						'</div>' +
						'</div>'
					);
				}
			}
		] );
	}
}

// Plugins to include in the build.
StellarEditor.builtinPlugins = [
	Essentials,
	Autoformat,
	Bold,
	Italic,
	Code,
	BlockQuote,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Link,
	List,
	Paragraph,
	PasteFromOffice,
	TextTransformation,
	CodeBlock,
	MediaEmbed
];

// Editor configuration.
StellarEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading',
			'|',
			'bold',
			'italic',
			'link',
			'bulletedList',
			'numberedList',
			'|',
			'uploadImage'
		]
	},
	image: {
		toolbar: [
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:side',
			'|',
			'toggleImageCaption',
			'imageTextAlternative'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};
