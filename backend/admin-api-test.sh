#!/usr/bin/env bash
# Admin CRUD smoke tests. Usage: bash admin-api-test.sh [baseUrl]
set -uo pipefail
A="${1:-http://localhost:3005/api}"
PASS=0; FAIL=0
SUF="t$(date +%s%N | tail -c 7)"
IMG='https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'
DESC='Mô tả đủ dài cho bản kiểm thử CRUD admin'

ck() {
  if [ "$2" = "$3" ]; then
    PASS=$((PASS+1)); printf '  ok   %-44s %s\n' "$1" "$3"
  else
    FAIL=$((FAIL+1)); printf '  FAIL %-44s want %s got %s\n' "$1" "$2" "$3"
  fi
}

# py <expr>  — reads stdin JSON, binds it to `d`
py() {
  python3 -c "
import json,sys
try:
    d = json.load(sys.stdin)
except Exception:
    print('ERR'); raise SystemExit
$1
"
}

code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

ADMIN=$(curl -s -X POST "$A/auth/login" -H 'Content-Type: application/json' \
  -d '{"email":"admin@dn.com","password":"admin123"}' | py 'print(d["accessToken"])')
AH="Authorization: Bearer $ADMIN"
CH="Content-Type: application/json"

CU="cu${SUF}@dn.com"
curl -s -X POST "$A/auth/register" -H "$CH" \
  -d "{\"email\":\"$CU\",\"password\":\"123456\",\"fullName\":\"C\"}" -o /dev/null
CT=$(curl -s -X POST "$A/auth/login" -H "$CH" \
  -d "{\"email\":\"$CU\",\"password\":\"123456\"}" | py 'print(d["accessToken"])')

echo "== GUARDS =="
ck "stats: no token"      401 "$(code "$A/admin/stats")"
ck "stats: customer"      403 "$(code "$A/admin/stats" -H "Authorization: Bearer $CT")"
ck "stats: admin"         200 "$(code "$A/admin/stats" -H "$AH")"
for res in categories products orders users; do
  ck "$res: customer 403" 403 "$(code "$A/admin/$res" -H "Authorization: Bearer $CT")"
  ck "$res: no token 401" 401 "$(code "$A/admin/$res")"
done
ck "old /api/upload gone" 404 "$(code "$A/upload/status" -H "$AH")"

echo "== STATS =="
S=$(curl -s "$A/admin/stats" -H "$AH")
ck "products.total is int"   True "$(echo "$S" | py 'print(isinstance(d["products"]["total"], int))')"
ck "revenue non-negative"    True "$(echo "$S" | py 'print(d["revenue"] >= 0)')"
ck "byGender has MALE"       True "$(echo "$S" | py 'print("MALE" in d["productsByGender"])')"
ck "orders.byStatus present" True "$(echo "$S" | py 'print("byStatus" in d["orders"])')"
ck "lowStockVariants is int" True "$(echo "$S" | py 'print(isinstance(d["lowStockVariants"], int))')"

echo "== CATEGORIES CRUD =="
C1=$(curl -s -X POST "$A/admin/categories" -H "$AH" -H "$CH" \
  -d "{\"name\":\"Loại $SUF\",\"gender\":\"MALE\",\"sortOrder\":9}")
CID=$(echo "$C1" | py 'print(d.get("id", ""))')
ck "create returns id"        True "$(echo "$C1" | py 'print(bool(d.get("id")))')"
ck "slug auto-generated"      True "$(echo "$C1" | py "print(d['slug'] == 'loai-$SUF')")"
ck "duplicate slug -> 409"    409 "$(code -X POST "$A/admin/categories" -H "$AH" -H "$CH" -d "{\"name\":\"Loại $SUF\",\"gender\":\"MALE\"}")"
ck "invalid gender -> 400"    400 "$(code -X POST "$A/admin/categories" -H "$AH" -H "$CH" -d '{"name":"Bad One","gender":"XXX"}')"
ck "name too short -> 400"    400 "$(code -X POST "$A/admin/categories" -H "$AH" -H "$CH" -d '{"name":"A","gender":"MALE"}')"
ck "read back"                200 "$(code "$A/admin/categories/$CID" -H "$AH")"
ck "patch name"               "Tên mới" "$(curl -s -X PATCH "$A/admin/categories/$CID" -H "$AH" -H "$CH" -d '{"name":"Tên mới"}' | py 'print(d["name"])')"
ck "patch sortOrder"          3 "$(curl -s -X PATCH "$A/admin/categories/$CID" -H "$AH" -H "$CH" -d '{"sortOrder":3}' | py 'print(d["sortOrder"])')"
ck "delete"                   200 "$(code -X DELETE "$A/admin/categories/$CID" -H "$AH")"
ck "delete again -> 404"      404 "$(code -X DELETE "$A/admin/categories/$CID" -H "$AH")"
BUSY=$(curl -s "$A/admin/categories?limit=100" -H "$AH" | py 'print(next(i["id"] for i in d["items"] if i["_count"]["products"] > 0))')
ck "delete w/ products 400"   400 "$(code -X DELETE "$A/admin/categories/$BUSY" -H "$AH")"

echo "== PRODUCTS CRUD =="
CAT=$(curl -s "$A/categories?gender=MALE" | py 'print(d[0]["id"])')
P=$(curl -s -X POST "$A/admin/products" -H "$AH" -H "$CH" -d "{
  \"name\":\"SP $SUF\", \"description\":\"$DESC\", \"brand\":\"TestBrand\",
  \"gender\":\"MALE\", \"basePrice\":199000, \"thumbnail\":\"$IMG\",
  \"categoryId\":\"$CAT\", \"isFeatured\": true,
  \"variants\": [{\"color\":\"Đen\",\"size\":\"M\",\"stock\":5},
               {\"color\":\"Trắng\",\"size\":\"L\",\"stock\":3}],
  \"images\": [{\"url\":\"$IMG\"}] }")
PID=$(echo "$P" | py 'print(d.get("id", ""))')
ck "create returns id"          True "$(echo "$P" | py 'print(bool(d.get("id")))')"
ck "2 variants created"         2 "$(echo "$P" | py 'print(len(d.get("variants", [])))')"
ck "1 image created"            1 "$(echo "$P" | py 'print(len(d.get("images", [])))')"
ck "bad category -> 404"        404 "$(code -X POST "$A/admin/products" -H "$AH" -H "$CH" -d "{\"name\":\"Bad $SUF\",\"description\":\"$DESC\",\"brand\":\"BrandX\",\"gender\":\"MALE\",\"basePrice\":1,\"thumbnail\":\"https://a.co/b.jpg\",\"categoryId\":\"khong-ton-tai\"}")"
ck "duplicate variant -> 409"   409 "$(code -X POST "$A/admin/products" -H "$AH" -H "$CH" -d "{\"name\":\"Dup $SUF\",\"description\":\"$DESC\",\"brand\":\"BrandX\",\"gender\":\"MALE\",\"basePrice\":1,\"thumbnail\":\"https://a.co/b.jpg\",\"categoryId\":\"$CAT\",\"variants\":[{\"color\":\"Đen\",\"size\":\"M\"},{\"color\":\"đen\",\"size\":\"m\"}]}")"
ck "negative price -> 400"      400 "$(code -X POST "$A/admin/products" -H "$AH" -H "$CH" -d "{\"name\":\"Neg $SUF\",\"description\":\"$DESC\",\"brand\":\"BrandX\",\"gender\":\"MALE\",\"basePrice\":-5,\"thumbnail\":\"https://a.co/b.jpg\",\"categoryId\":\"$CAT\"}")"
ck "short description -> 400"   400 "$(code -X POST "$A/admin/products" -H "$AH" -H "$CH" -d "{\"name\":\"Sh $SUF\",\"description\":\"ngắn\",\"brand\":\"BrandX\",\"gender\":\"MALE\",\"basePrice\":1,\"thumbnail\":\"https://a.co/b.jpg\",\"categoryId\":\"$CAT\"}")"
ck "patch basePrice"            249000 "$(curl -s -X PATCH "$A/admin/products/$PID" -H "$AH" -H "$CH" -d '{"basePrice":249000}' | py 'print(d["basePrice"])')"
ck "patch isFeatured=false"     False "$(curl -s -X PATCH "$A/admin/products/$PID" -H "$AH" -H "$CH" -d '{"isFeatured":false}' | py 'print(d["isFeatured"])')"
V1=$(curl -s "$A/admin/products/$PID" -H "$AH" | py 'print(next(v["id"] for v in d["variants"] if v["color"] == "Đen" and v["size"] == "M"))')
S0=$(curl -s "$A/admin/products/$PID" -H "$AH" | py 'print(next(v["stock"] for v in d["variants"] if v["color"] == "Đen" and v["size"] == "M"))')
ck "stock INCREASE $S0->$((S0+2))"      $((S0+2)) "$(curl -s -X PATCH "$A/admin/products/variants/$V1/stock" -H "$AH" -H "$CH" -d '{"quantity":2,"mode":"INCREASE"}' | py 'print(d["stock"])')"
ck "stock DECREASE -> $((S0-1))"        $((S0-1)) "$(curl -s -X PATCH "$A/admin/products/variants/$V1/stock" -H "$AH" -H "$CH" -d '{"quantity":3,"mode":"DECREASE"}' | py 'print(d["stock"])')"
ck "stock SET = 10"             10 "$(curl -s -X PATCH "$A/admin/products/variants/$V1/stock" -H "$AH" -H "$CH" -d '{"quantity":10,"mode":"SET"}' | py 'print(d["stock"])')"
ck "negative stock -> 400"      400 "$(code -X PATCH "$A/admin/products/variants/$V1/stock" -H "$AH" -H "$CH" -d '{"quantity":-99,"mode":"SET"}')"
ck "unknown variant -> 404"     404 "$(code -X PATCH "$A/admin/products/variants/khong-ton-tai/stock" -H "$AH" -H "$CH" -d '{"quantity":1,"mode":"SET"}')"
ck "variant sync keeps count"   2 "$(curl -s -X PATCH "$A/admin/products/$PID" -H "$AH" -H "$CH" -d '{"variants":[{"color":"Đen","size":"M","stock":11},{"color":"Xanh","size":"XL","stock":1}]}' | py 'print(len(d["variants"]))')"
ck "filter isActive=true finds" True "$(curl -s "$A/admin/products?isActive=true&limit=100" -H "$AH" | py "print(any(i['id'] == '$PID' for i in d['items']))")"
ck "search by name finds"       True "$(curl -s "$A/admin/products?search=SP%20$SUF" -H "$AH" | py "print(any(i['id'] == '$PID' for i in d['items']))")"
SLUG=$(curl -s "$A/admin/products/$PID" -H "$AH" | py 'print(d["slug"])')
ck "soft delete active"         False "$(curl -s -X DELETE "$A/admin/products/$PID" -H "$AH" | py 'print(d.get("deleted"))')"
ck "hidden from public API"     404 "$(code "$A/products/$SLUG")"
ck "hard delete when inactive"  True "$(curl -s -X DELETE "$A/admin/products/$PID" -H "$AH" | py 'print(d.get("deleted"))')"
ck "gone from admin too"        404 "$(code "$A/admin/products/$PID" -H "$AH")"

echo "== USERS CRUD =="
U=$(curl -s -X POST "$A/admin/users" -H "$AH" -H "$CH" -d "{\"email\":\"new${SUF}@t.com\",\"password\":\"123456\",\"fullName\":\"Người Mới\"}")
NEWUID=$(echo "$U" | py 'print(d.get("id", ""))')
ck "create returns id"          True "$(echo "$U" | py 'print(bool(d.get("id")))')"
ck "password not echoed"        None "$(echo "$U" | py 'print(d.get("password"))')"
ck "duplicate email -> 409"     409 "$(code -X POST "$A/admin/users" -H "$AH" -H "$CH" -d "{\"email\":\"new${SUF}@t.com\",\"password\":\"123456\",\"fullName\":\"Trùng Email\"}")"
ck "short password -> 400"      400 "$(code -X POST "$A/admin/users" -H "$AH" -H "$CH" -d "{\"email\":\"a${SUF}@t.com\",\"password\":\"12\",\"fullName\":\"X\"}")"
ck "patch fullName"             "Tên Mới" "$(curl -s -X PATCH "$A/admin/users/$NEWUID" -H "$AH" -H "$CH" -d '{"fullName":"Tên Mới"}' | py 'print(d["fullName"])')"
ck "promote to ADMIN"           ADMIN "$(curl -s -X PATCH "$A/admin/users/$NEWUID" -H "$AH" -H "$CH" -d '{"role":"ADMIN"}' | py 'print(d["role"])')"
ME=$(curl -s "$A/auth/me" -H "$AH" | py 'print(d["id"])')
ck "cannot demote self"         400 "$(code -X PATCH "$A/admin/users/$ME" -H "$AH" -H "$CH" -d '{"role":"CUSTOMER"}')"
ck "cannot delete self"         400 "$(code -X DELETE "$A/admin/users/$ME" -H "$AH")"
ck "reset password"             200 "$(code -X PATCH "$A/admin/users/$NEWUID/password" -H "$AH" -H "$CH" -d '{"password":"newpass123"}')"
ck "new password logs in"       201 "$(code -X POST "$A/auth/login" -H "$CH" -d "{\"email\":\"new${SUF}@t.com\",\"password\":\"newpass123\"}")"
ck "old password rejected"      401 "$(code -X POST "$A/auth/login" -H "$CH" -d "{\"email\":\"new${SUF}@t.com\",\"password\":\"123456\"}")"
ck "read detail ok"             200 "$(code "$A/admin/users/$NEWUID" -H "$AH")"
ck "delete"                     200 "$(code -X DELETE "$A/admin/users/$NEWUID" -H "$AH")"
ck "delete again -> 404"        404 "$(code -X DELETE "$A/admin/users/$NEWUID" -H "$AH")"
UWO=$(curl -s "$A/admin/orders?limit=1" -H "$AH" | py 'print(d["items"][0]["userId"] if d["items"] else "")')
[ -n "$UWO" ] && ck "delete user w/ orders 400" 400 "$(code -X DELETE "$A/admin/users/$UWO" -H "$AH")"

echo "== ORDERS CRUD =="
OID=$(curl -s "$A/admin/orders?status=PENDING&limit=1" -H "$AH" | py 'print(d["items"][0]["id"] if d["items"] else "")')
if [ -n "$OID" ]; then
  ck "read order"                  200 "$(code "$A/admin/orders/$OID" -H "$AH")"
  ck "includes items"              True "$(curl -s "$A/admin/orders/$OID" -H "$AH" | py 'print(len(d["items"]) > 0)')"
  ck "includes user"               True "$(curl -s "$A/admin/orders/$OID" -H "$AH" | py 'print("email" in d["user"])')"
  ck "transitions endpoint"         True "$(curl -s "$A/admin/orders/$OID/transitions" -H "$AH" | py 'print("allowed" in d and "current" in d)')"
  ck "PENDING allows CONFIRMED"     True "$(curl -s "$A/admin/orders/$OID/transitions" -H "$AH" | py 'print("CONFIRMED" in d["allowed"])')"
  ck "PENDING->DELIVERED 400"       400 "$(code -X PATCH "$A/admin/orders/$OID/status" -H "$AH" -H "$CH" -d '{"status":"DELIVERED"}')"
  ck "bad status value -> 400"      400 "$(code -X PATCH "$A/admin/orders/$OID/status" -H "$AH" -H "$CH" -d '{"status":"NOPE"}')"
  ck "patch recipientName"          "Tên Nhận" "$(curl -s -X PATCH "$A/admin/orders/$OID" -H "$AH" -H "$CH" -d '{"recipientName":"Tên Nhận"}' | py 'print(d["recipientName"])')"
  ck "patch address"                "Số 1 Đường" "$(curl -s -X PATCH "$A/admin/orders/$OID" -H "$AH" -H "$CH" -d '{"address":"Số 1 Đường"}' | py 'print(d["address"])')"
  ck "delete non-cancelled 400"     400 "$(code -X DELETE "$A/admin/orders/$OID" -H "$AH")"
  ck "confirm -> 200"               200 "$(code -X PATCH "$A/admin/orders/$OID/status" -H "$AH" -H "$CH" -d '{"status":"CONFIRMED"}')"
  ck "status is CONFIRMED"          CONFIRMED "$(curl -s "$A/admin/orders/$OID" -H "$AH" | py 'print(d["status"])')"
  ck "CONFIRMED->PENDING 400"       400 "$(code -X PATCH "$A/admin/orders/$OID/status" -H "$AH" -H "$CH" -d '{"status":"PENDING"}')"
  ONUM=$(curl -s "$A/admin/orders/$OID" -H "$AH" | py 'print(d["orderNumber"])')
  ck "search by orderNumber"        True "$(curl -s "$A/admin/orders?search=$ONUM" -H "$AH" | py "print(any(i['id'] == '$OID' for i in d['items']))")"
  ck "filter status CONFIRMED"      True "$(curl -s "$A/admin/orders?status=CONFIRMED&limit=100" -H "$AH" | py "print(any(i['id'] == '$OID' for i in d['items']))")"
  ck "invalid status filter 400"    400 "$(code "$A/admin/orders?status=BOGUS" -H "$AH")"

  echo "== CANCEL RESTOCKS =="
  VQ=$(curl -s "$A/admin/orders/$OID" -H "$AH" | py 'print(d["items"][0]["variantId"])')
  QTY=$(curl -s "$A/admin/orders/$OID" -H "$AH" | py 'print(d["items"][0]["quantity"])')
  stock_of() {
    curl -s "$A/admin/products?limit=100" -H "$AH" |
      py "print(next((v['stock'] for p in d['items'] for v in p['variants'] if v['id'] == '$VQ'), -1))"
  }
  BEFORE=$(stock_of)
  curl -s -X PATCH "$A/admin/orders/$OID/status" -H "$AH" -H "$CH" \
    -d '{"status":"CANCELLED"}' -o /dev/null
  AFTER=$(stock_of)
  ck "cancel restocks stock" "$((BEFORE + QTY))" "$AFTER"
  ck "cancelled is terminal" 400 "$(code -X PATCH "$A/admin/orders/$OID/status" -H "$AH" -H "$CH" -d '{"status":"CONFIRMED"}')"
  ck "delete cancelled ok"    200 "$(code -X DELETE "$A/admin/orders/$OID" -H "$AH")"
else
  echo "  skip: no PENDING orders in db"
fi

echo
echo "PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ]