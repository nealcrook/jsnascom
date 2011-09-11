/*
        JSNascom: A Nascom 2 emulator in JavaScript
        Copyright (C) 2011 Tommy Thorn

        Contact details: <tommy . thorn at gmail dot com>

        partly based on JSSpeccy: Spectrum architecture implementation
        for JSSpeccy, a ZX Spectrum emulator in Javascript

        This program is free software: you can redistribute it and/or modify
        it under the terms of the GNU General Public License as published by
        the Free Software Foundation, either version 3 of the License, or
        (at your option) any later version.

        This program is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
        GNU General Public License for more details.

        You should have received a copy of the GNU General Public License
        along with this program.  If not, see <http://www.gnu.org/licenses/>.


    A Nascom consists of:

    - a Z80 CPU,
    - an UART,
    - a bitmapped keyboard,
    - memory:
        0000 - 07ff  2 KB ROM monitor,
        0800 - 0bff  1 KB screen memory,
        0c00 - 0fff  1 KB workspace
        1000 - dfff       memory
        e000 - ffff  8 KB of MS Basic

  With the Z80 emulator in place the first thing to get working is the
  screen memory.  The "correct" way to simulate screen memory is to
  trap upon writes, but that would be slow.  We do it any just to get
  started.

*/

var memory = []; // XXX use typed arrays instead
var canvas;
var ctx;
var imageData;
var imageDataData;
var keyStates = [];
var imageDataShadow = []; /* clone of imageDataData; - used to skip writing pixels to canvas if there's no change */

var hasImageData;
var needDrawImage = (navigator.userAgent.indexOf('Firefox/2') != -1);

var nassys3 = "1\0\20\327\10\303\376\3\337b\330\30\373\303\336\3\343#\343\345\365\303\204\5\30\366\327\0\337f\353\311\343+\343\303}\14\0\0\343~#\267 \6\343\311\345\303U\7\367\30\362\0=\310\365\361\30\372\257G\377\377\20\374\311\345!\0\14\256\323\0~\323\0\341\311>\20\345!\0\14\256w\30\362\365\323\1\333\2\313w(\372\361\311\303}\14\345*2\14\337b8\5+|\265 \367\341\311*)\14V6_\327\351r\330\327\345\60\362\311\333\2\27\320\333\1\311\337a0\7*.\14\42,\14\311*,\14+\42,\14|\265\300!\2\14\1\0\10\26\377}\376\6 \2\26\277\376\11 \2\26\307~\242(\6\16\1z/\246w#\20\344y\267\310*0\14\42,\14>\2\315E\0!\1\14\333\0/w\6\10>\1\315E\0#\333\0/\346\177W\256 \4\20\357\267\311\257\377\333\0/\346\177_z\256\16\377\26\0\67\313\22\14\37\60\372z\243_~\242\273(\337~\252w{\267(\330:\1\14\346\20\260\207\207\207\261\327P(\6\346\177\327J \306y!\1\14\376A8\26\376[0\22\313f(\1?:'\14\313Gy(\1?8\2\306 \376@ \6\313f(\240\30\6\313n(\2\356@\313^(\2\356@!\6\14\313v(\2\356\200!'\14\313V(\2\356\200\67\311*o\14\355Km\14\355\271\311`\0\31\6\0\7y\7|\7\303/\0\303/\0\303\200\2P\0\0\1\267\310\365\376\12($\376\14 \42!\12\10\345\6\60\66 #\20\373\6\20\66\0#\20\373\353\341\345\1\260\3\355\260\341\337|\42)\14\361\311*)\14\376\10 \21\365+~\267(\373\361\376\21(\2\66 \327c\30\346\376\21(\353\376\27(\331\376\33 \13\337|\6\60\66 #\20\373\30\312\376\15(m\376\30 \14\345\337|\321\267\355R\31(\272\30]\376\23 \10\21\300\377\31\327,\30\257\376\24 \5\21@\0\30\362\376\25 \16#~+\267 \4\66 \30\230w#\30\362\376\26 \37\6 ~\267(\212pG#\30\367\21\12\10\267\355R\31\330\21\272\13\267\355R\31\320\361\303\270\1\376\22(\1w#~\267(\373\21\312\13\267\355R\31 \352\337|\21@\0\31\327\321\21\12\10!J\10\1p\3\355\260\6\60+6 \20\373\30\316}\346\300\306\12o\311\337`\42\14\14\337~\337f~\337h\357 \21\21\21\0\327T\337d8L~\267(H#\325^#V\353\321\6\0\345\337d~\267(\7#~\341w\4#\345\341\32\376.\310\376, \5\23\32\23\30\356x\267 \1#\32\376: \4++\30\263\376/ \12\23\337d8\14*!\14\30\245\267(\242\376 (\301\337k\30\230\327\30!u\4\42~\14\345\337{\367\376\15 \371*)\14\21\300\377\31\353\341\311\257\62&\14*#\14~2%\14\311\337j\301\267\355R\31\320x\261 \7\317\376\33\310\315\366\4\13\305\337~\337f\345:\22\14\306\10G\305:\25\14\267 \5~\337h\337i#\20\362\337~\301\341:\24\14\267 \14~<\346\177\376!~0\2>.\367#\20\353\30\266|\337g}\337g> \367\311\327\372\30\370\357Error\0>\15\367\311\365\201O\361\365\37\37\37\37\327\1\361\346\17\306\220'\316@'\367\311\32\376 \23(\372\33!\0\0\42!\14\257! \14w\32\267\310\376 \310\326\60\330\376\12\70\13\326\7\376\12\330\376\20\70\2\67\311\23\64#\355o#\355o++(\334\33\67\311\1\13\14\257\2\337d\330~\267\310#\3~\2#\3~\2!\13\14\64~\376\13\70\351\67\311\327f\21\0\14\6m\257\22\23\20\374!y\1\1\21\0\355\260\21.\14\1\6\0\355\260\357\14\0\311\61a\14!\0\20\42k\14\357-- NAS-SYS 3 --\15\0\327+\315\350\2\1+\14\32\376  \5\12\376S \360\376A8\15\376[0\11\2\62\12\14\23\337y0\4\337k\30\333\337`\337\134\30\325*#\14|\265\310:%\14w\311>\377\62&\14\361:\13\14\267(\3\42i\14\301\321\341\361\355{k\14\345*i\14\343\365>\10\323\0\361\355E\365\345:\0\14\323\0:&\14\267(\15\315\2\3|\265(\2\66\347\341\361\355E\327\265\325\305!\0\0\71\61a\14\21a\14\1\12\0\355\260\42k\14\327\2\30\233\357\30\0!m\14\6\6+V+^\345\353^#V+\337l\341\337~\20\357\355W\337h\337i\335\345\341\337f\375\345\341\337f:g\14\21\346\4\6\10\23\27\365\32\60\1\367\361\20\366\337j\311SZ\0H\0PNC*\14\14\355[\16\14\355K\20\14\311\337_\337]\337w\345\257G\337o\20\374\337`\327\346\353\67\355R\332}\6\353\257\377\6\5\337o>\377\20\372\257\272 \2C\4X}\337o|\337o{\337oz\337o\16\0\337ly\337o\337m\6\13y\337o\257\20\373\337j\30\304\267\355R\31\60\11\13\353\11\353\11\3\355\270\311\355\260\311\353\345\31\337f\341\267\355R\337f++|\313\5\316\0(\6\357??\15\0\311}\17\337h\303m\3DM\355Y\311DM\355x\30\360\325!\6\0\71^#V\353++\313^# \13^{\27\237W#\31\321\361\343\311^\26\0*q\14\31\31^#V\353\30\356\345\365\325!\12\14\30\352\345\365\325\30\346\377\377\377\377\377\377\377\377\10\377\216\377\210\11\377\377\377>.F6\276\256\16\377\377\377\211\377\377\377\377\24\234\233\243\222\302\272\262\252\242\230\240)\12!\31\32\34\33#\22B:2*\42\30 \251\212\241\231\15,A\23;3C\20@-80(19%\35$\25\64E5\21+D=<\36\236\26\232\226}2'\14\311\42#\14\311!t\7\337q\345!M\6\6\6~\367\16\24\257\377\15 \374#\20\364\337W\257\377>E\367*\20\14\337f>\15\367\341\337q\311\15E0\15R\15\16\0~\337o\201O#\20\370\311\337_\337w\345\337x\345\6\3O\317\271 \371\20\372\376\377(\20\376\33 \357\357\30\0\341\337r\341\337q\303Q\0\317o\317g\317_\317W\16\0\337l\317\271 ):\13\14\267(\5\355K\14\14\11C\16\0:+\14\376R(\3\317\30\2\317w\345*)\14w\341\201O#\20\351\317\271(\6\357? \0\30\244\357. \0\257\272 \234\30\253!{\7\337r!x\7\337q\311}2(\14!\177\7\337r!w\7\337q\311\337p\320\346\177!(\14\313n\314\35\7\313N \15\365\327\33\361\267(\6\376\33(\2\313\376\67\311\365!(\14\313~\314\23\7\313\276\361\311\327\10\376\15\300\313f\300>\12\267\365\352$\7\356\200\313F(\2\356\200\315[\0\361\311\337c\30\374\337x!y\7\345*s\14\343\42s\14\341\311!|\7\345*u\14\343\42u\14\341\311\345!u\14\30\3!s\14\325\305^#V\365\32\23\267(\14o\361\325\267]\315\265\5\321\60\357\365\361\301\321\341\311eo\0nue\0v}p\0t}\0X\5\37\6U\5\0\320Q\4f\3#\6/\7F\5\372\377\32\6f\3\200\2\63\7y\5\251\4~\5^\6V\4\36\3\314\6^\6\373\4\327\6\0\310\375\377\376\3\255\5>\0E\0Q\0\357\4\316\0O\7\360\2\207\3\220\1X\3q\3u\3^\3m\3f\3\32\0S\6\6\7[\0\207\0\70\7E\7X\7\346\6w\14z\14\65\7B\7\300\3}\3x\0y\2\216\0b\3\265\5";

var basic = "\303\3\340\363\335!\0\0\303\22\340\213\351\362\360\303<\347!\0\20\371\303\273\376\21\337\342\6c!\0\20\32w#\23\5\302!\340\371\315\337\344\315\201\353\62\252\20\62\371\20!\3\341\315\20\362\315\374\344\315\66\350\267\302[\340!]\21#|\265\312m\340~G/w\276p\312I\340\303m\340\315\245\351\267\302\255\343\353+>\331Fw\276p\302\66\340+\21\134\21\315\212\346\332\66\340\0\0\0\0\0\0\0\0\0\21\316\377\42\257\20\31\42Z\20\315\272\344*Z\20\21\357\377\31\21\371\20}\223o|\232g\345!\305\340\315\20\362\341\315\255\371!\267\340\315\20\362\61f\20\315\337\344\303\370\343 Bytes free\15\0\0NASCOM ROM BASIC Ver 4.7   \15Copyright (C) 1978 by Microsoft\15\0\0Memory size\0\42\370\346\370\70\370\3\20\320\360A\364\376\360\254\372\213\373\307\366\372\372\0\374\6\374g\374|\374\243\365\274\375Q\20\202\363\232\361\34\364\221\363\242\363\262\363\342\363\354\363\305ND\306OR\316EXT\304ATA\311NPUT\304IM\322EAD\314ET\307OTO\322UN\311F\322ESTORE\307OSUB\322ETURN\322EM\323TOP\317UT\317N\316ULL\327AIT\304EF\320OKE\304OKE\323CREEN\314INES\303LS\327IDTH\315ONITOR\323ET\322ESET\320RINT\303ONT\314IST\303LEAR\303LOAD\303SAVE\316EW\324AB(\324O\306N\323PC(\324HEN\316OT\323TEP\253\255\252\257\336\301ND\317R\276\275\274\323GN\311NT\301BS\325SR\306RE\311NP\320OS\323QR\322ND\314OG\305XP\303OS\323IN\324AN\301TN\320EEK\304EEK\320OINT\314EN\323TR$\326AL\301SC\303HR$\314EFT$\322IGHT$\315ID$\200r\350y\347\366\354p\352\375\353(\357,\354\207\352-\352\20\352\377\352F\350\34\352K\352r\352p\350M\364\341\352\261\350S\364\6\361\252\365\307\375\346\375\255\375\213\375\245\375\242\376T\20W\20#\353\236\350\335\346\312\351\371\364\303\364\271\344y\224\371y\310\365|\6\367|g\367\177\265\372P\201\356F\200\356NFSNRGODFCOVOMULBSDD/0IDTMOSLSSTCNUFMO\303\256\340\303\240\351\323\0\311\326\0o|\336\0gx\336\0G>\0\311\0\0\0\65J\312\231\71\34v\230\42\225\263\230\12\335G\230S\321\231\231\12\32\237\230e\274\315\230\326w>\230R\307O\200\333\0\311\1/\34\0\0\5\0\5\0\0\0\0\0\303\7\346\303y\377\303@\377\303U\377]\21\376\377\372\20 Error\0 in \0Ok\15\0\0Break\0!\4\0\71~#\376\201\300N#F#\345i`z\263\353\312p\343\353\315\212\346\1\15\0\341\310\11\303Z\343\315\223\343\305\343\301\315\212\346~\2\310\13+\303\177\343\345*\332\20\6\0\11\11>\345>\320\225o>\377\234\332\242\343g9\341\330\36\14\303\301\343*\311\20\42\134\20\36\2\1\36\24\1\36\0\1\36\22\1\36\42\1\36\12\1\36\30\315\337\344\62E\20\315t\353!\271\342W>?\315\233\346\31~\315\233\346\315\66\350\315\233\346!?\343\315\20\362*\134\20\21\376\377\315\212\346\312\22\340|\245<\304\245\371>\301\257\62E\20\315t\353!K\343\315\20\362!\377\377\42\134\20\315\362\345\332\5\344\315\66\350<=\312\5\344\365\315\245\351\325\315\11\345G\321\361\322\26\350\325\305\257\62\314\20\315\66\350\267\365\315\231\344\332>\344\361\365\312F\352\267\305\322U\344\353*\326\20\32\2\3\23\315\212\346\302F\344`i\42\326\20\321\361\312|\344*\326\20\343\301\11\345\315y\343\341\42\326\20\353t\321##s#r#\21a\20\32w#\23\267\302t\344\315\305\344#\353bk~#\266\312\5\344###\257\276#\302\215\344\353s#r\303\201\344*^\20DM~#\266+\310##~#fo\315\212\346`i~#fo?\310?\320\303\234\344\300*^\20\257w#w#\42\326\20*^\20+\42\316\20*\257\20\42\303\20\257\315F\350*\326\20\42\330\20\42\332\20\301*Z\20\371!\263\20\42\261\20\257og\42\324\20\62\313\20\42\336\20\345\305*\316\20\311>?\315\233\346> \315\233\346\303N\20\257\62\256\20\16\5\21a\20~\376 \312\221\345G\376\42\312\261\345\267\312\270\345:\256\20\267~\302\221\345\376?>\236\312\221\345~\376\60\332<\345\376<\332\221\345\325\21B\341\305\1\215\345\305\6\177~\376a\332U\345\376{\322U\345\346_wN\353#\266\362W\345\4~\346\177\310\271\302W\345\353\345\23\32\267\372\211\345Ox\376\210\302x\345\315\66\350+#~\376a\332\201\345\346_\271\312g\345\341\303U\345H\361\353\311\353y\301\321#\22\23\14\326:\312\237\345\376I\302\242\345\62\256\20\326T\302\22\345G~\267\312\270\345\270\312\221\345#\22\14\23\303\250\345!`\20\22\23\22\23\22\311:D\20\267>\0\62D\20\302\325\345\5\312\362\345\315\233\346>\5+\312\351\345~\315\233\346\303\20\346\5+\315\233\346\302\20\346\315\233\346\315\201\353\303\7\346\315m\376\312\7\346*u\14~\376t\312\7\346\315\350\376\303\206\353!a\20\6\1\257\62D\20\315\314\346O\376\177\312\301\345:D\20\267\312)\346>\0\315\233\346\257\62D\20y\376\7\312m\346\376\3\314\201\353\67\310\376\15\312|\353\376\25\312\354\345\376@\312\351\345\376_\312\341\345\376\10\312\341\345\376\22\302h\346\305\325\345\66\0\315\364\377!a\20\315\20\362\341\321\301\303\20\346\376 \332\20\346x\376I>\7\322\202\346yq2\314\20#\4\315\233\346\303\20\346\315\233\346>\10\303|\346|\222\300}\223\311~\343\276#\343\312\66\350\303\255\343\365:E\20\267\302E\362\361\305\365\376 \332\277\346:B\20G:\253\20\4\312\273\346\5\270\314\201\353<2\253\20\361\301\365\361\365\305O\315\331\374\301\361\311\315\5\375\346\177\376\17\300:E\20/2E\20\257\311\315\245\351\300\301\315\231\344\305\315\63\347\341N#F#x\261\312\370\343\315F\347\315a\350\305\315\201\353^#V#\345\353\315\255\371> \341\315\233\346~\267#\312\351\346\362\11\347\326\177O\21C\341\32\23\267\362\33\347\15\302\33\347\346\177\315\233\346\32\23\267\362%\347\303\14\347\345*H\20\42F\20\341\311!\336\376\42~\14\303\370\343\376\345\325*F\20\21\377\377\355Z\42F\20\321\341\360\345*H\20\42F\20:L\20\267\302\345\376\315\5\375\376\3\312p\347\341\303F\347*H\20\42F\20\303\261\340>d2\313\20\315\207\352\301\345\315p\352\42\307\20!\2\0\71\315Z\343\321\302\251\347\11\325+V+^##\345*\307\20\315\212\346\341\302\215\347\321\371\353\16\10\315\212\343\345*\307\20\343\345*\134\20\343\315D\355\315\220\346\246\315A\355\345\315_\370\341\305\325\1\0\201QZ~\376\253>\1\302\345\347\315\66\350\315A\355\345\315_\370\315\23\370\341\305\325\365\63\345*\316\20\343\6\201\305\63\315@\375\267\304f\350\42\316\20~\376:\312\26\350\267\302\255\343#~#\266\312z\350#^#V\353\42\134\20\353\315\66\350\21\362\347\325\310\326\200\332\207\352\376%\322\255\343\7O\6\0\353!Z\342\11N#F\305\353#~\376:\320\376 \312\66\350\376\60?<=\311\353*^\20\312[\350\353\315\245\351\345\315\231\344`i\321\322F\352+\42\334\20\353\311\315@\375\267\310\315\314\346\376\23\314\314\346\376\3\300\366\300\42\316\20!\366\377\301*\134\20\365}\244<\312\215\350\42\322\20*\316\20\42\324\20\257\62E\20\315t\353\361!P\343\302\341\343\303\370\343*\324\20|\265\36 \312\301\343\353*\322\20\42\134\20\353\311\315\204\364\300\62A\20\311\6\377\315\66\350x2\316\20>\1\62\313\20\315-\357\345\62\313\20`i\13\13\13\13:\316\20\267\365\353\31\353N\6\0\11\11#\345\325\305:\316\20\376\377\314\325\374:\316\20\376\377\304\310\374\0\0\0!\0\0\42J\20\301\321\341\6\322\303\326\377x\315\267\364\315\267\364\303\35\351\16\4\315\264\364\270\302\20\351\15\302\22\351\315D\355\315\212\346\312\67\351\361\365~\364\272\364\374\264\364w\315@\351#\303 \351\315M\351\315\325\374\361\341\311\345*J\20\6\0O\11\42J\20\341\311:\316\20\267\372`\351:J\20\315\272\364:K\20\303\272\364\315\264\364\365\315\264\364\301XW*J\20\315\212\346\310\315\325\374\303k\365~\376A\330\376[?\311\315\66\350\315A\355\315\23\370\372\240\351:\347\20\376\220\332\273\370\1\200\220\21\0\0\345\315\216\370\341Q\310\36\10\303\301\343+\21\0\0\315\66\350\320\345\365!\230\31\315\212\346\332\255\343bk\31)\31)\361\326\60_\26\0\31\353\341\303\251\351\312\311\344\315\202\351+\315\66\350\345*\257\20\312\355\351\341\315\220\346,\325\315\202\351+\315\66\350\302\255\343\343\353}\223_|\232W\332\242\343\345*\326\20\1(\0\11\315\212\346\322\242\343\353\42Z\20\341\42\257\20\341\303\311\344\312\305\344\315\311\344\1\362\347\303,\352\16\3\315\212\343\301\345\345*\134\20\343>\214\365\63\305\315\245\351\315r\352\345*\134\20\315\212\346\341#\334\234\344\324\231\344`i+\330\36\16\303\301\343\300\26\377\315V\343\371\376\214\36\4\302\301\343\341\42\134\20#|\265\302j\352:\314\20\267\302\367\343!\362\347\343>\341\1:\16\0\6\0yHG~\267\310\270\310#\376\42\312v\352\303y\352\315-\357\315\220\346\264\325:\255\20\365\315Z\355\361\343\42\316\20\37\315F\355\312\332\352\345*\344\20\345##^#V*^\20\315\212\346\322\311\352*Z\20\315\212\346\321\322\321\352!\277\20\315\212\346\322\321\352>\321\315q\363\353\315\252\361\315q\363\341\315n\370\341\311\345\315k\370\321\341\311\315\204\364~G\376\214\312\360\352\315\220\346\210+K\15x\312\36\350\315\246\351\376,\300\303\361\352\315Z\355~\376\210\312\15\353\315\220\346\251+\315D\355\315\23\370\312r\352\315\66\350\332-\352\303\35\350+\315\66\350\312\201\353\310\376\245\312\257\353\376\250\312\257\353\345\376,\312\230\353\376;\312\322\353\301\315Z\355\345:\255\20\267\302m\353\315\270\371\315\316\361\66 *\344\20\64*\344\20:B\20G\4\312i\353\4:\253\20\206=\270\324\201\353\315\23\362\257\304\23\362\341\303\37\353:\253\20\267\310\303\201\353\66\0!`\20>\15\315\233\346\257\62\253\20:A\20=\310\365\257\315\233\346\361\303\215\353:C\20G:\253\20\270\324\201\353\322\322\353\326\16\322\246\353/\303\307\353\365\315\201\364\315\220\346)+\361\326\250\345\312\302\353:\253\20/\203\322\322\353<G> \315\233\346\5\302\313\353\341\315\66\350\303&\353?Redo from start\15\12\0:\315\20\267\302\247\343\301!\331\353\315\20\362\303\370\344\315{\361~\376\42>\0\62E\20\302\27\354\315\317\361\315\220\346;\345\315\23\362>\345\315\374\344\301\332w\350#~\267+\305\312o\352\66,\303\61\354\345*\334\20\366\257\62\315\20\343\303=\354\315\220\346,\315-\357\343\325~\376,\312e\354:\315\20\267\302\322\354>?\315\233\346\315\374\344\321\301\332w\350#~\267+\305\312o\352\325:\255\20\267\312\217\354\315\66\350WG\376\42\312\203\354:\315\20\267W\312\200\354\26:\6,+\315\322\361\353!\232\354\343\325\303\242\352\315\66\350\315\32\371\343\315k\370\341+\315\66\350\312\246\354\376,\302\354\353\343+\315\66\350\302\71\354\321:\315\20\267\353\302\134\350\325\266!\301\354\304\20\362\341\311?Extra ignored\15\12\0\315p\352\267\302\353\354#~#\266\36\6\312\301\343#^#V\353\42\311\20\353\315\66\350\376\203\302\322\354\303e\354\21\0\0\304-\357\42\316\20\315V\343\302\263\343\371\325~#\365\325\315Q\370\343\345\315\276\365\341\315k\370\341\315b\370\345\315\216\370\341\301\220\315b\370\312\61\355\353\42\134\20i`\303\356\347\371*\316\20~\376,\302\362\347\315\66\350\315\371\354\315Z\355\366\67:\255\20\217\267\350\303\277\343\315\220\346\264\303Z\355\315\220\346(+\26\0\325\16\1\315\212\343\315\321\355\42\320\20*\320\20\301x\376x\324D\355~\26\0\326\263\332\222\355\376\3\322\222\355\376\1\27\252\272W\332\255\343\42\305\20\315\66\350\303v\355z\267\302\250\356~\42\305\20\326\254\330\376\7\320_:\255\20=\263{\312\6\363\7\203_!\244\342\31xV\272\320#\315D\355\305\1i\355\305CJ\315D\370XQN#F#\305*\305\20\303]\355\257\62\255\20\315\66\350\36$\312\301\343\332\32\371\315w\351\322\42\356\376\254\312\321\355\376.\312\32\371\376\255\312\21\356\376\42\312\317\361\376\252\312\10\357\376\247\312\63\361\326\266\322\63\356\315V\355\315\220\346)\311\26}\315]\355*\320\20\345\315<\370\315D\355\341\311\315-\357\345\353\42\344\20:\255\20\267\314Q\370\341\311\6\0\7O\305\315\66\350y\376\42\312y\377\376-\332_\356\315V\355\315\220\346,\315E\355\353*\344\20\343\345\353\315\204\364\353\343\303g\356\315\11\356\343\21\35\356\325\1\17\341\11N#fi\351\25\376\255\310\376-\310\24\376+\310\376\254\310+\311\366\257\365\315D\355\315\213\351\361\353\301\343\353\315T\370\365\315\213\351\361\301y!\361\360\302\243\356\243Ox\242\351\263Ox\262\351!\272\356:\255\20\37z\27_\26dx\272\320\303\272\355\274\356y\267\37\301\321\365\315F\355!\376\356\345\312\216\370\257\62\255\20\325\315S\363~##N#F\321\305\365\315W\363\315b\370\361W\341{\262\310z\326\1\330\257\273<\320\25\35\12\276#\3\312\346\356?\303\36\370<\217\301\240\306\377\237\303%\370\26Z\315]\355\315D\355\315\213\351{/Oz/\315\361\360\301\303i\355+\315\66\350\310\315\220\346,\1\37\357\305\366\257\62\254\20F\315w\351\332\255\343\257O2\255\20\315\66\350\332I\357\315w\351\332V\357O\315\66\350\332J\357\315w\351\322J\357\326$\302e\357<2\255\20\17\201O\315\66\350:\313\20=\312\22\360\362u\357~\326(\312\352\357\257\62\313\20\345PY*\336\20\315\212\346\21\340\20\312T\367*\330\20\353*\326\20\315\212\346\312\250\357y\226#\302\235\357x\226#\312\334\357####\303\217\357\341\343\325\21%\356\315\212\346\321\312\337\357\343\345\305\1\6\0*\332\20\345\11\301\345\315y\343\341\42\332\20`i\42\330\20+6\0\315\212\346\302\316\357\321s#r#\353\341\311\62\347\20!J\343\42\344\20\341\311\345*\254\20\343W\325\305\315\177\351\301\361\353\343\345\353<W~\376,\312\360\357\315\220\346)\42\320\20\341\42\254\20\36\0\325\21\345\365*\330\20>\31\353*\332\20\353\315\212\346\312J\360~\271#\302,\360~\270#^#V#\302\30\360:\254\20\267\302\266\343\361DM\312T\367\226\312\250\360\36\20\303\301\343\21\4\0\361\312\240\351q#p#O\315\212\343##\42\305\20q#:\254\20\27y\1\13\0\322m\360\301\3q#p#\365\345\315\377\370\353\341\361=\302e\360\365BK\353\31\332\242\343\315\223\343\42\332\20+6\0\315\212\346\302\213\360\3W*\305\20^\353)\11\353++s#r#\361\332\314\360GO~#\26\341^#V#\343\365\315\212\346\322E\360\345\315\377\370\321\31\361=DM\302\255\360))\301\11\353*\320\20\311*\332\20\353!\0\0\71:\255\20\267\312\354\360\315S\363\315S\362*Z\20\353*\303\20}\223O|\232AP\36\0!\255\20s\6\220\303*\370:\253\20G\257\303\362\360\315\211\361\315{\361\1p\352\305\325\315\220\346(\315-\357\345\353+V+^\341\315D\355\315\220\346)\315\220\346\264DM\343q#p\303\310\361\315\211\361\325\315\11\356\315D\355\343^#V#z\263\312\271\343~#fo\345*\336\20\343\42\336\20*\342\20\345*\340\20\345!\340\20\325\315k\370\341\315A\355+\315\66\350\302\255\343\341\42\340\20\341\42\342\20\341\42\336\20\341\311\345*\134\20#|\265\341\300\36\26\303\301\343\315\220\346\247>\200\62\313\20\266G\315\62\357\303D\355\315D\355\315\270\371\315\316\361\315S\363\1\256\363\305~##\345\315)\362\341N#F\315\302\361\345o\315F\363\321\311\315)\362!\277\20\345w##s#r\341\311+\6\42P\345\16\377#~\14\267\312\344\361\272\312\344\361\270\302\325\361\376\42\314\66\350\343#\353y\315\302\361\21\277\20*\261\20\42\344\20>\1\62\255\20\315n\370\315\212\346\42\261\20\341~\300\36\36\303\301\343#\315\316\361\315S\363\315b\370\34\35\310\12\315\233\346\376\15\314\206\353\3\303\32\362\267\16\361\365*Z\20\353*\303\20/O\6\377\11#\315\212\346\332G\362\42\303\20#\353\361\311\361\36\32\312\301\343\277\365\1+\362\305*\257\20\42\303\20!\0\0\345*Z\20\345!\263\20\353*\261\20\353\315\212\346\1d\362\302\270\362*\326\20\353*\330\20\353\315\212\346\312\213\362~##\267\315\273\362\303u\362\301\353*\332\20\353\315\212\346\312\341\362\315b\370{\345\11\267\362\212\362\42\305\20\341N\6\0\11\11#\353*\305\20\353\315\212\346\312\213\362\1\252\362\305\366\200~##^#V#\360\267\310DM*\303\20\315\212\346`i\330\341\343\315\212\346\343\345`i\320\301\361\361\345\325\305\311\321\341}\264\310+F+N\345++n&\0\11PY+DM*\303\20\315|\343\341q#pi`+\303V\362\305\345*\344\20\343\315\321\355\343\315E\355~\345*\344\20\345\206\36\34\332\301\343\315\277\361\321\315W\363\343\315V\363\345*\301\20\353\315=\363\315=\363!f\355\343\345\303\360\361\341\343~##N#Fo,-\310\12\22\3\23\303G\363\315E\355*\344\20\353\315q\363\353\300\325PY\33N*\303\20\315\212\346\302o\363G\11\42\303\20\341\311*\261\20+F+N++\315\212\346\300\42\261\20\311\1\1\361\305\315P\363\257W2\255\20~\267\311\1\1\361\305\315\206\363\312\240\351##^#V\32\311>\1\315\277\361\315\207\364*\301\20s\301\303\360\361\315\67\364\257\343O\345~\270\332\300\363x\21\16\0\305\315)\362\301\341\345##F#fh\6\0\11DM\315\302\361o\315F\363\321\315W\363\303\360\361\315\67\364\321\325\32\220\303\266\363\353~\315<\364\4\5\312\240\351\305\36\377\376)\312\5\364\315\220\346,\315\204\364\315\220\346)\361\343\1\270\363\305=\276\6\0\320O~\221\273G\330C\311\315\206\363\312\63\366_##~#fo\345\31Fr\343\305~\315\32\371\301\341p\311\353\315\220\346)\301\321\305C\311\315\207\364\62?\20\315>\20\303\1\361\315q\364\303\6\20\315q\364\365\36\0+\315\66\350\312g\364\315\220\346,\315\204\364\301\315>\20\253\240\312h\364\311\315\204\364\62?\20\62\7\20\315\220\346,\303\204\364\315\66\350\315A\355\315\205\351z\267\302\240\351+\315\66\350{\311*^\20\42\326\20!\0\200^#V##\42^\20\353\42\257\20\42Z\20\1\362\347\305\303\305\344\303V\375\315\272\364\365\305O\315h\375\301\361\311\6\1\376\256\312\273\350\315Z\355\345\315\225\363\325\315\310\374\321>\323\315\272\364\315\267\364\32\315\272\364\0\0\0!\326\20\42\14\14*\326\20\42\16\14\315s\376\315\330\374\341\311~\376\256\312\271\350\315\321\377\326\236\312\11\365\257\1/#\365+\315\66\350>\0\312\34\365\315Z\355\315\225\363\32o\361\365\267g\42\344\20\314\272\344*\344\20\353\6\3\315\264\364\326\323\302+\365\5\302-\365\315\264\364\315t\365\34\35\312H\365\273\302+\365\0\0\0\361\267\302\134\365\315\210\376*\326\20\315\223\343\303_\365\315\252\376!K\343\315\20\362\315\330\374\303|\344!\235\365\315\20\362\303\341\343\305\345\325\365!\216\365\315\20\362\361\365\315\331\374!\224\365\315\20\362\361\321\341\301\311File \0 Found\15\12\0Bad\0\0\0\315\213\351\32\303\1\361\315A\355\315\213\351\325\315\220\346,\315\204\364\321\22\311!\221\372\315b\370\303\315\365\315b\370!\301\321\315<\370x\267\310:\347\20\267\312T\370\220\322\347\365/<\353\315D\370\353\315T\370\301\321\376\31\320\365\315y\370g\361\315\222\366\264!\344\20\362\15\366\315r\366\322S\366#4\312\274\343.\1\315\250\366\303S\366\257\220G~\233_#~\232W#~\231O\334~\366hc\257Gy\267\302@\366JTeox\326\10\376\340\302!\366\257\62\347\20\311\5)z\27Wy\217O\362\70\366x\134E\267\312S\366!\347\20\206w\322\63\366\310x!\347\20\267\374e\366F#~\346\200\251O\303T\370\34\300\24\300\14\300\16\200\64\300\303\274\343~\203_#~\212W#~\211O\311!\350\20~/w\257o\220G}\233_}\232W}\231O\311\6\0\326\10\332\241\366CZQ\16\0\303\224\366\306\11o\257-\310y\37Oz\37W{\37_x\37G\303\244\366\0\0\0\201\3\252V\31\200\361\42v\200E\252\70\202\315\23\370\267\352\240\351!\347\20~\1\65\200\21\363\4\220\365p\325\305\315\315\365\301\321\4\315i\367!\266\366\315\304\365!\272\366\315[\373\1\200\200\21\0\0\315\315\365\361\315\216\371\1\61\200\21\30r!\301\321\315\23\370\310.\0\315\321\367y2\366\20\353\42\367\20\1\0\0PX!\36\366\345!*\367\345\345!\344\20~#\267\312V\367\345.\10\37gy\322D\367\345*\367\20\31\353\341:\366\20\211\37Oz\37W{\37_x\37G-|\302\63\367\341\311CZQO\311\315D\370\1 \204\21\0\0\315T\370\301\321\315\23\370\312\260\343.\377\315\321\367\64\64+~2\22\20+~2\16\20+~2\12\20A\353\257OW_2\25\20\345\305}\315\11\20\336\0?\322\241\367\62\25\20\361\361\67\322\301\341y<=\37\372T\366\27{\27_z\27Wy\27O)x\27G:\25\20\27\62\25\20y\262\263\302\216\367\345!\347\20\65\341\302\216\367\303\274\343x\267\312\365\367}!\347\20\256\200G\37\250x\362\364\367\306\200w\312T\367\315y\370w+\311\315\23\370/\341\267\341\362\63\366\303\274\343\315_\370x\267\310\306\2\332\274\343G\315\315\365!\347\20\64\300\303\274\343:\347\20\267\310:\346\20\376/\27\237\300<\311\315\23\370\6\210\21\0\0!\347\20Op\6\0#6\200\27\303\33\366\315\23\370\360!\346\20~\356\200w\311\353*\344\20\343\345*\346\20\343\345\353\311\315b\370\353\42\344\20`i\42\346\20\353\311!\344\20^#V#N#F#\311\21\344\20\6\4\32w\23#\5\302p\370\311!\346\20~\7\67\37w?\37##wy\7\67\37O\37\256\311x\267\312\23\370!\34\370\345\315\23\370y\310!\346\20\256y\370\315\250\370\37\251\311#x\276\300+y\276\300+z\276\300+{\226\300\341\341\311GOW_\267\310\345\315_\370\315y\370\256g\374\337\370>\230\220\315\222\366|\27\334e\366\6\0\334~\366\341\311\33z\243<\300\13\311!\347\20~\376\230:\344\20\320~\315\273\370\66\230{\365y\27\315\33\366\361\311!\0\0x\261\310>\20)\332E\360\353)\353\322\25\371\11\332E\360=\302\7\371\311\376-\365\312&\371\376+\312&\371+\315\63\366GW_/O\315\66\350\332w\371\376.\312R\371\376E\302V\371\315\66\350\315p\356\315\66\350\332\231\371\24\302V\371\257\223_\14\14\312.\371\345{\220\364o\371\362e\371\365\315[\367\361<\302Y\371\321\361\314<\370\353\311\310\365\315\374\367\361=\311\325Wx\211G\305\345\325\315\374\367\361\326\60\315\216\371\341\301\321\303.\371\315D\370\315%\370\301\321\303\315\365{\7\7\203\7\206\326\60_\303D\371\345!F\343\315\20\362\341\353\257\6\230\315*\370!\17\362\345!\351\20\345\315\23\370\66 \362\306\371\66-#60\312|\372\345\374<\370\257\365\315\202\372\1C\221\21\370O\315\216\370\267\342\363\371\361\315p\371\365\303\325\371\315[\367\361<\365\315\202\372\315\273\365<\315\273\370\315T\370\1\6\3\361\201<\372\17\372\376\10\322\17\372<G>\2==\341\365\21\225\372\5\302 \372\66.#60#\5\66.\314i\370\305\345\325\315_\370\341\6/\4{\226_#z\236W#y\236O++\322/\372\315r\366#\315T\370\353\341p#\301\15\302 \372\5\312`\372+~\376\60\312T\372\376.\304i\370\361\312\177\372\66E#6+\362p\372\66-/<\6/\4\326\12\322r\372\306:#p#w#q\341\311\1t\224\21\367#\315\216\370\267\341\342\352\371\351\0\0\0\200\240\206\1\20'\0\350\3\0d\0\0\12\0\0\1\0\0!<\370\343\351\315D\370!\221\372\315Q\370\301\321\315\23\370x\312\372\372\362\305\372\267\312\260\343\267\312\64\366\325\305y\366\177\315_\370\362\342\372\325\305\315\346\370\301\321\365\315\216\370\341|\37\341\42\346\20\341\42\344\20\334\247\372\314<\370\325\305\315\307\366\301\321\315\10\367\315D\370\1\70\201\21;\252\315\10\367:\347\20\376\210\322\357\367\315\346\370\306\200\306\2\332\357\367\365!\266\366\315\276\365\315\377\366\361\301\321\365\315\312\365\315<\370!:\373\315j\373\21\0\0\301J\303\10\367\10@.\224tpO.wn\2\210z\346\240*|P\252\252~\377\377\177\177\0\0\200\201\0\0\0\201\315D\370\21\6\367\325\345\315_\370\315\10\367\341\315D\370~#\315Q\370\6\361\301\321=\310\325\305\365\345\315\10\367\341\315b\370\345\315\315\365\341\303s\373\315\23\370!\31\20\372\354\373!:\20\315Q\370!\31\20\310\206\346\7\6\0w#\207\207O\11\315b\370\315\10\367:\30\20<\346\3\6\0\376\1\210\62\30\20!\360\373\207\207O\11\315\276\365\315_\370{Y\356OO6\200+F6\200!\27\20\64~\326\253\302\343\373w\14\25\34\315\36\366!:\20\303k\370w+w+w\303\307\373h\261Fh\231\351\222i\20\321uh!J\374\315\276\365\315D\370\1I\203\21\333\17\315T\370\301\321\315i\367\315D\370\315\346\370\301\321\315\312\365!N\374\315\304\365\315\23\370\67\362\66\374\315\273\365\315\23\370\267\365\364<\370!N\374\315\276\365\361\324<\370!R\374\303[\373\333\17I\201\0\0\0\177\5\272\327\36\206d&\231\207X4#\207\340]\245\206\332\17I\203\315D\370\315\6\374\301\341\315D\370\353\315T\370\315\0\374\303g\367\315\23\370\374\247\372\374<\370:\347\20\376\201\332\231\374\1\0\201QY\315i\367!\304\365\345!\243\374\315[\373!J\374\311\11J\327;x\2n\204{\376\301/|t1\232}\204=Z}\310\177\221~\344\273L~l\252\252\177\0\0\0\201\315\71\376\6\0\315\233\375\5\302\315\374\311\303\71\376\311\345\305\325\365\315m\376\302\373\374\361\365\376\12\312\0\375\376\10\302\361\374>\35\376\15\302\375\374>\37\303\375\374\361\365\315E\376\361\321\301\341\311\345\305\325\315m\376\312\23\375\337{\303\31\375\315M\14\322\23\375\376\35\302 \375>\10\376\34\302'\375>\3\376\32\302.\375>\177\376\33\302\65\375>\3\376\37\302<\375>\15\321\301\341\311\257\315p\375\312P\375:M\20\267\302P\375\257\311\315S\376>\377\311\333\2\27\322V\375\333\1\311\323\1\333\2\207\370\303a\375\365\315_\375\361\311\0\0\345>\2!\0\14\256\323\0\356\1\323\0\356\2\323\0~\323\0\31\341\333\0\346\22\311\315m\376\312\226\375>\14\303\331\374>\36\303\331\374\257\365\361\365\361=\302\234\375\311\315\204\364{2B\20\311\315A\355\315\213\351\355SF\20\355SH\20\311\315\213\351\325\341F#~\303\362\360\315A\355\315\213\351\325\315\220\346,\315A\355\315\213\351\343s#r\341\311\363\335!\377\377\303\22\340\315\204\364\365\315\220\346,\315\204\364\301\345\305\315\21\376\345\315m\376\312\4\376\341\42)\14\341\311*\30\14\66 \341\42\30\14\66_\341\311!\311\7\6\0O\267\312\240\351\376\21\362\240\351\321\361\325\26\0_\267\312\240\351\376\61\362\240\351\31\26\0Y\6@\31\20\375\311\315m\376\312B\376\337_\311\303Q\0\365\315m\376\312O\376\361\367\311\361\303J\14:M\20\302e\376\315m\376\312b\376\337b\311\303M\14>\0\62M\20>\3\311:\1\0\376\63\311\315\71\376\315m\376\312\177\376\337W\311:\215\0\312\0\4\303\321\3\315\71\376\315m\376\312\231\376>R2+\14\337R\311:\215\0\312\14\7\303\321\3\315m\376\312\0\0\337[\315\71\376\315m\376\312\240\351>V2+\14\337V\311>\0\62M\20\315m\376\312\31\340!\336\376\42~\14\335\345\361\267\302\31\340\6\17\315\315\374\315\15\0\303\31\340\365>\377\62M\20\361\355E\0\337c\325\325\341\21/\0\31~\376 \302\2\377\35>\0\263\312\2\377+\303\361\376\325\301\3\21a\20\341\305\355\260>\0\22\301A!`\20\311\315\220\346(\315A\355\315\213\351\325\315\220\346,\315A\355\315\220\346)\315\213\351\345\375\341\315\226\377\365\315\302\377\315\21\376\361\6\300\260\311\315\25\377\365~\376\300\322P\377\361w\375\345\341\311\301\260\303K\377\315\25\377\365~\376\300\332u\377\6?\240\301\240\312L\377~\346?\250\376\300\302K\377> \303K\377\301\303L\377\315\25\377F\315\355\377\302\221\377>\0\6\1\341\375\345\21\35\356\325\303\362\360\6\0\303\207\377\301\341\345\305}\6\1\240\365\325\341\21\0\0\1\3\0#\355B\23\312\261\377\362\250\377\11\361\267}\312\272\377\306\3G>\1\7\20\375\37\311\301\361\341\365}\37\306\1\346?g\345\305{\311\315\325\374~\311:\316\20\376\377\302\6\351\303\20\351\315\201\353\303\362\345\315\201\353\303\362\345\365\240\301\270>\0\311\315\233\346\303\201\353\303\336\375\303\261\340";

var nasfont;

var keyp = 0;
var port0 = 0;
var keym = [
  0,  /* ? ? ? Shift ? ? ? ? */
  0,  /* ?!TXF5BH  ! = Up*/
  0,  /* ?!YZD6NJ  ! = Left*/
  0,  /* ?!USE7MK  ! = Down */
  0,  /* ?!IAW8,L  ! = Right */
  0,  /* ??OQ39.; */
  0,  /* ?[P120/: */
  0,  /* ?]R C4VG */
  0   /* ? ? CR - Newline BS */
];

var kbd_translation = [
/* 0 */  "xxxxxxxx",
/* 1 */  "xyTXF5BH",
/* 2 */  "xyYZD6NJ",
/* 3 */  "xyUSE7MK",
/* 4 */  "xyIAW8,L",
/* 5 */  "xxOQ39.;",
/* 6 */  "x[P120/'",
/* 7 */  "x]R C4VG",
/* 8 */  "x\rxxx-\n\007"
];

function nascom_init() {
    var i;

    nasfont = new Image();
    nasfont.src = 'data:image/png;base64,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';

    ctx = document.getElementById('screen').getContext('2d');
    z80_init();

    // NASSYS-3
    for (i = 0; i < 0x800; i++)
        memory[i] = nassys3.charCodeAt(i);

    // Memory
    for (; i < 0xE000; i++)
        memory[i] = 0;

    // ROM Basic
    for (; i < 0x10000; i++)
        memory[i] = basic.charCodeAt(i - 0xE000);

    canvas = document.getElementById('screen');
    ctx = canvas.getContext('2d');

    document.onkeydown  = keyDown;
    document.onkeyup    = keyUp;
    document.onkeypress = keyPress;

    run();
}

function registerKey(evt, down) {
    var keyNum = evt.keyCode;
    var row = -1, bit, i;

    console.log("registerKey " + keyNum + "/" + evt.charCode + "/" + String.fromCharCode(evt.charCode) + "/" + event.char);

    // Based on http://www.cambiaresearch.com/c4/702b8cd1-e5b0-42e6-83ac-25f0306e3e25/javascript-char-codes-key-codes.aspx

    switch (keyNum) {
    case  8: row = 8, bit = 0; break; // backspace
    case 13: row = 8, bit = 1; break; // enter
    case 16: row = 0, bit = 4; break; // shift
    case 37: row = 2, bit = 6; break; // left arrow
    case 38: row = 1, bit = 6; break; // up arrow
    case 39: row = 4, bit = 6; break; // right arrow
    case 40: row = 3, bit = 6; break; // down arrow
    }

    if (row == -1) {
        var ch = String.fromCharCode(evt.charCode).toUpperCase();

        for (i = 0; i < 9 && row == -1; ++i)
            for (bit = 0; bit < 8; ++bit)
                if (kbd_translation[i][7-bit] == ch) {
                    row = i;
                    break;
                }
    }

    if (row != -1) {
        if (down)
            keym[row] |= 1 << bit;
        else
            keym[row] &= ~(1 << bit);
        return;
    }
}

function keyDown(evt) {
    console.log("keyDown "+evt);
    registerKey(evt, true)
    if (!evt.metaKey) return false;
}

function keyUp(evt) {
    console.log("keyDown "+evt);
    registerKey(evt, false);
    if (!evt.metaKey) return false;
}

function keyPress(evt) {
    if (!evt.metaKey) return false;
}

function frame() {
    event_next_event = 69888;
    tstates = 0;

    z80_do_opcodes();
    /* dumpScreen(); */
    /* dumpKeys(); */
    //flashFrame = (flashFrame + 1) & 0x1f;

    paintScreen();
    z80_interrupt();
}

function run() {

    // if (!running) return;
    frame();



    setTimeout(run, 20);
}

function contend_memory(addr) {
    return 0; /* TODO: implement */
}
function contend_port(addr) {
    return 0; /* TODO: implement */
}
function readbyte(addr) {
    return readbyte_internal(addr);
}
function readbyte_internal(addr) {
    return memory[addr];
}
function readport(port) {
    port &= 255;
    switch (port) {
    case 0:
        /* KBD */
        /* printf("[%d]", keyp); */
        return ~keym[keyp];
    case 2:
        /* Status port on the UART */
        return 0;
    default:
        return 0;
    }
}
function writeport(port, value) {
    port &= 255;

    if (port == 0) {
        /* KBD */
        var down_trans = port0 & ~value;
        port0 = value;

        if ((1 & down_trans) && keyp < 9)
            keyp++;
        if (2 & down_trans)
            keyp = 0;
    }
}
function writebyte(addr, val) {
    return writebyte_internal(addr, val)
}
function writebyte_internal(addr, val) {
    if (addr < 0x800)
        return;

    var col = addr & 63;

    if (addr < 0xC00 && 10 <= col && col < 58) {
        // Visible Screen write
        var oldByte = memory[addr];
        memory[addr] = val;
        if (val != oldByte)
            drawScreenByte(addr, val);
    } else
        memory[addr] = val;
}

function drawScreenByte(addr, val) {
    var x = (addr & 63) - 10;
    var y = ((addr >> 6) + 1) & 15;

    ctx.drawImage(nasfont,
                  0, 16*val,	// sx,sy
                  8, 16,	// sWidth, sHeight
                  x*8,y*16,	// dx,dy
                  8, 16);	// dWidth, dHeight
}

function paintScreen() {
    for (var addr = 0x800; addr < 0xC00; ++addr) {
        col = addr & 63;
        if (10 <= col && col < 58)
            drawScreenByte(addr, memory[addr]);
    }
}
